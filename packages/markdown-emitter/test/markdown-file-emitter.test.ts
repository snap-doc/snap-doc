import { CommentFencedCode } from '@code-to-json/comments';
import { FormattedSymbolKind } from '@code-to-json/formatter';
import { nodeHost } from '@code-to-json/utils-node';
import { expect } from 'chai';
import { suite, test } from 'mocha-typescript';
import { join } from 'path';
import { MarkdownFileEmitter } from '../src';

@suite
export class MarkdownFileEmitterTests {
  @test
  public 'markdown emitter'(): void {
    const writeParams: Array<[string, string]> = [];
    const mfe = new MarkdownFileEmitter({
      projectName: 'foo',
      outDir: 'out',
      host: {
        ...nodeHost,
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
        // tslint:disable-next-line:no-empty
        async removeFolderAndContents(_name: string): Promise<void> {},
        // tslint:disable-next-line:no-empty
        createFolder(_name: string): void {},
        writeFileSync(filePath: string, contents: string): void {
          writeParams.push([filePath, contents]);
        }
      }
    });
    mfe.generate({
      types: {},
      symbols: {
        '12345': {
          id: '12345',
          kind: FormattedSymbolKind.module,
          name: 'src/foo/bar'
        }
      },
      sourceFiles: {
        foo: {
          id: '',
          path: 'src/foo/bar',
          extension: 'ts',
          moduleName: 'foo',
          symbol: ['s', '12345'] as any,
          isDeclarationFile: false,
          documentation: {
            summary: ['My favorite module'],
            customTags: [
              {
                kind: 'blockTag' as 'blockTag',
                tagName: 'author',
                content: ['Mike']
              },
              {
                kind: 'blockTag' as 'blockTag',
                tagName: 'foobar',
                content: ['Baz']
              },
              {
                kind: 'blockTag' as 'blockTag',
                tagName: 'example',
                content: [
                  {
                    kind: 'fencedCode',
                    language: 'js',
                    code: 'foo() {}'
                  } as CommentFencedCode
                ]
              }
            ]
          }
        }
      }
    });
    expect(writeParams).to.be.instanceOf(Array);
    expect(writeParams).to.have.lengthOf(1);
    expect(writeParams[0][0]).to.eql('out/src/foo/bar.md');
    expect(writeParams[0][1]).to.eql(`# foo

## Table of Contents

*   [Examples](#examples)

\`src/foo/bar\`

| Information |      |
| :---------- | :--: |
| **author**  | Mike |

My favorite module

## Examples


\`\`\`js
foo() {}
\`\`\`


| Other Details |     |
| :------------ | :-: |
| **foobar**    | Baz |`);
  }
}
