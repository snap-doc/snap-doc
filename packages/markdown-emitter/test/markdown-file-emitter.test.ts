import { CommentFencedCode } from '@code-to-json/comments';
import { LinkedFormattedOutputData } from '@code-to-json/formatter-linker';
import { NODE_HOST } from '@code-to-json/utils-node';
import { expect } from 'chai';
import { suite, test } from 'mocha-typescript';
import { join } from 'path';
import MarkdownFileEmitter from '../src/emitter';
import MarkdownFileEmitterWorkspace from '../src/emitter/workspace';

@suite
export class MarkdownFileEmitterTests {
  @test
  public async 'markdown emitter'(): Promise<void> {
    const writeParams: Array<[string, string]> = [];
    const mfe = new MarkdownFileEmitter(
      {
        ...NODE_HOST,
        combinePaths(...paths: string[]): string {
          return join(...paths);
        },
        fileOrFolderExists(_path: string): boolean {
          return false;
        },
        isFolder(_path: string): boolean {
          return true;
        },
        isFile(_path: string): boolean {
          return true;
        },
        async removeFolderAndContents(_name: string): Promise<void> {},
        createFolder(_name: string): void {},
        writeFileSync(filePath: string, contents: string): void {
          writeParams.push([filePath, contents]);
        },
      },
      {
        projectName: 'foo',
        outDir: 'out',
      },
    );
    const fwo: LinkedFormattedOutputData = {
      types: {},
      symbols: {
        '12345': {
          id: '12345',
          kind: 'symbol',
          flags: ['module'],
          name: 'src/foo/bar',
        },
      },
      declarations: {},
      nodes: {},
      sourceFiles: {
        foo: {
          id: '',
          path: 'src/foo/bar',
          extension: 'ts',
          moduleName: 'foo',
          symbol: ['s', '12345'] as any,
          isDeclarationFile: false,
          kind: 'sourceFile',
          documentation: {
            summary: ['My favorite module'],
            customTags: [
              {
                kind: 'blockTag' as 'blockTag',
                tagName: 'author',
                content: ['Mike'],
              },
              {
                kind: 'blockTag' as 'blockTag',
                tagName: 'foobar',
                content: ['Baz'],
              },
              {
                kind: 'blockTag' as 'blockTag',
                tagName: 'example',
                content: [
                  {
                    kind: 'fencedCode',
                    language: 'js',
                    code: 'foo() {}',
                  } as CommentFencedCode,
                ],
              },
            ],
          },
        },
      },
    };

    const workspace = new MarkdownFileEmitterWorkspace(NODE_HOST, {
      path: 'out',
      main: 'src/index.ts',
      name: 'my-example-project',
    });
    workspace.data = fwo;
    await mfe.emit(workspace);
    expect(writeParams).to.be.instanceOf(Array);
    expect(writeParams.map(x => x[0])).to.deep.eq(['out/modules/foo/bar.md', 'out/index.md']);
    expect(writeParams[0][1])
      .to.contain('# `foo`')
      .to.contain('My favorite module').to.contain(`| Information |      |
| :---------- | :--: |
| **author**  | Mike |`).to.contain(`| Other Details |     |
| :------------ | :-: |
| **foobar**    | Baz |`);
    expect(writeParams[1][1]).to.contain('# my-example-project').to.contain(`## Modules

*   [foo](modules/foo/bar.md "foo"`);
  }
}
