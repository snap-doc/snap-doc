import { FixtureFolder, setupTestCase } from '@code-to-json/test-helpers';
import { findPkgJson, NODE_HOST } from '@code-to-json/utils-node';
import { DocGenerator } from '@snap-doc/core';
import * as debug from 'debug';
import { readFileSync } from 'fs';
import { join } from 'path';
import { FileEmitterWorkspace } from '@snap-doc/emitter';
import { MarkdownFileEmitter } from '../../src';

const log = debug('snap-doc:markdown-emitter:acceptance-tests');

export class AcceptanceTestCase {
  constructor(
    public readonly root: string,
    private caseCleanup: () => void,
    private folderStr: string,
  ) {}

  public cleanup() {
    this.caseCleanup();
  }

  public contentFor(fileName: string): string {
    return readFileSync(join(this.root, fileName)).toString();
  }

  public toString() {
    return this.folderStr;
  }
}

export async function setupAcceptanceTest(
  src: FixtureFolder,
  singleFile = true,
  extension: 'md' | 'html' = 'md',
): Promise<AcceptanceTestCase> {
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
          lib: ['scripthost', 'esnext'],
        },
        include: ['../src/**/*.ts', '**/*.ts'],
      }),
    },
    ['src/index.ts'],
  );
  const pkg = await findPkgJson(testCase.rootPath);
  if (!pkg) {
    throw new Error('no package.json found');
  }
  const pkgInfo = {
    path: pkg.path,
    name: pkg.contents.name,
    main: pkg.contents['doc:main'] || pkg.contents.main || pkg.path,
  };
  const dg = new DocGenerator(testCase.program, NODE_HOST, {
    emitters: [
      new MarkdownFileEmitter(NODE_HOST, {
        outDir: NODE_HOST.combinePaths(testCase.rootPath, 'out'),
        omitToc: true,
        detailedModules: singleFile,
        html: extension === 'html',
      }),
    ],
    pkgInfo,
  });
  const workspace = new FileEmitterWorkspace(NODE_HOST, pkgInfo);
  await dg.emit(workspace);
  return new AcceptanceTestCase(
    NODE_HOST.combinePaths(testCase.rootPath, 'out'),
    testCase.cleanup,
    `${testCase}`,
  );
}
