import { FixtureFolder, setupTestCase } from '@code-to-json/test-helpers';
import { findPkgJson, NODE_HOST } from '@code-to-json/utils-node';
import { DocEnv, DocGenerator } from '@snap-doc/core';
import * as debug from 'debug';
import { readFileSync } from 'fs';
import { join } from 'path';
import { MarkdownFileEmitter } from '../../src';

const log = debug('snap-doc:markdown-emitter:acceptance-tests');

class AcceptanceTestCase {
  constructor(
    private rootPath: string,
    private caseCleanup: () => void,
    private folderStr: string
  ) {}
  public cleanup() {
    this.caseCleanup();
  }
  public contentFor(fileName: string): string {
    return readFileSync(join(this.rootPath, fileName)).toString();
  }
  public toString() {
    return this.folderStr;
  }
}

export async function setupAcceptanceTest(src: FixtureFolder): Promise<AcceptanceTestCase> {
  log('hello');
  const testCase = await setupTestCase(
    {
      src,
      'package.json': JSON.stringify({ name: 'my-pkg', main: 'src/index.ts' }),
      'tsconfig.json': JSON.stringify({
        compilerOptions: {
          module: 'commonjs',
          target: 'es2015',
          experimentalDecorators: true,
          lib: ['scripthost', 'esnext']
        },
        include: ['../src/**/*.ts', '**/*.ts']
      })
    },
    ['src/index.ts']
  );
  const pkg = await findPkgJson(testCase.rootPath);
  if (!pkg) {
    throw new Error('no package.json found');
  }
  const pkgInfo = {
    path: pkg.path,
    name: pkg.contents.name,
    main: pkg.contents['doc:main'] || pkg.contents.main || pkg.path
  };
  const dg = new DocGenerator(testCase.program, NODE_HOST, {
    emitter: new MarkdownFileEmitter(NODE_HOST, {
      outDir: NODE_HOST.combinePaths(testCase.rootPath, 'out'),
      omitToc: true
    }),
    pkgInfo
  });
  const env = new DocEnv(pkgInfo, NODE_HOST);
  await dg.emit(env);
  return new AcceptanceTestCase(
    NODE_HOST.combinePaths(testCase.rootPath, 'out'),
    testCase.cleanup,
    '' + testCase
  );
}
