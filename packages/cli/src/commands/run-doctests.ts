import { CommentBlockTag } from '@code-to-json/comments';
import { walkProgram } from '@code-to-json/core';
import { formatWalkerOutput } from '@code-to-json/formatter';
import {
  LinkedFormattedOutputData,
  LinkedFormattedSourceFile,
  LinkedFormattedSymbol,
  linkFormatterData,
} from '@code-to-json/formatter-linker';
import { isDefined } from '@code-to-json/utils';
import { findPkgJson, NODE_HOST } from '@code-to-json/utils-node';
import { createProgramFromTsConfig, createReverseResolver } from '@code-to-json/utils-ts';
import * as debug from 'debug';
import { runTest } from 'doc-tester';

const log = debug('snap-doc:cli');

/**
 * @internal
 */
interface DocTest {
  codeArray: string[];
  importsArray: string[];
}

/**
 * @internal
 */
interface DocTestSymbol {
  name: string;
  tests: DocTest[];
}

/**
 * @internal
 */
interface DocTestFile {
  name: string;
  symbols: DocTestSymbol[];
}

function gatherDocTest(tag: CommentBlockTag): DocTest | undefined {
  const { content } = tag;
  if (!content) {
    return undefined;
  }
  const contentArr = content.filter((c): c is string => typeof c === 'string' && c !== '\n');
  const codeArray: string[] = [];
  const importsArray: string[] = [];
  contentArr.forEach(s => {
    if (s.trim().indexOf('import') === 0) {
      importsArray.push(s);
    } else {
      codeArray.push(s);
    }
  });
  return {
    codeArray,
    importsArray,
  };
}

function gatherSymbolDocTests(sym: LinkedFormattedSymbol): DocTestSymbol | undefined {
  const { documentation } = sym;
  if (!documentation) {
    return undefined;
  }
  const { customTags } = documentation;
  if (!customTags) {
    return undefined;
  }

  const examples = customTags.filter(ct => ['example', 'doctest'].indexOf(ct.tagName) >= 0);
  if (examples.length === 0) {
    return undefined;
  }
  const { name } = sym;
  return { name, tests: examples.map(gatherDocTest).filter(isDefined) };
}

function gatherFileDocTests(file: LinkedFormattedSourceFile): DocTestFile | undefined {
  const fileSym = file.symbol;
  if (!fileSym || typeof fileSym.exports === 'undefined') {
    return undefined;
  }
  const { exports: fileExports } = fileSym;
  const exportSyms = Object.keys(fileExports)
    .map(expName => fileExports[expName])
    .filter(isDefined);
  return { name: file.moduleName, symbols: exportSyms.map(gatherSymbolDocTests).filter(isDefined) };
}

function gatherProgramDocTests(linked: LinkedFormattedOutputData): DocTestFile[] {
  return Object.keys(linked.sourceFiles)
    .map(k => linked.sourceFiles[k])
    .filter(isDefined)
    .map(gatherFileDocTests)
    .filter(isDefined);
}

export default async function runDoctests(pth: string): Promise<void> {
  const prog = await createProgramFromTsConfig(pth, NODE_HOST);
  const pkg = await findPkgJson(pth);
  if (!pkg) {
    throw new Error(`Could not find package.json via search path "${pth}"`);
  }
  const pkgInfo = {
    path: pkg.path,
    name: pkg.contents.name,
    main: pkg.contents['doc:main'] || pkg.contents.main || pkg.path,
  };
  const walkerOutput = walkProgram(prog, NODE_HOST, {
    pathNormalizer: createReverseResolver(NODE_HOST, pkgInfo),
  });

  const formatted = formatWalkerOutput(walkerOutput);
  const linked = linkFormatterData(formatted.data);
  const docTests = gatherProgramDocTests(linked);
  await Promise.all(
    docTests.map(async file => {
      // for each file
      const { name: fileName, symbols } = file;
      if (symbols.length === 0) {
        log(`  📦  ${fileName} - no exported symbols w/ doctests`);
        return;
      }
      console.log(`  📦  ${fileName}`);
      await Promise.all(
        // for each symbol exported by the file
        symbols.map(async s => {
          const { name: symName, tests } = s;
          if (tests.length === 0) {
            log(`    ${symName} - no doctests`);
            return;
          }
          await Promise.all(
            // for each tagged blog comment (i.e., an @example or @doctest)
            tests.map(async t => {
              const { codeArray, importsArray } = t;
              // run the test
              await runTest({ codeArray, importsArray });
            }),
          )
            .then(() => console.log(`    ✅ ${symName}`))
            .catch(() => console.log(`    ❌ ${symName}`));
        }),
      );
    }),
  );
}
