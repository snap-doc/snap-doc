import { CommentFencedCode } from '@code-to-json/comments';
import { FormattedSourceFile } from '@code-to-json/formatter';
import { nodeHost } from '@code-to-json/utils-node';
import { expect } from 'chai';
import { suite, test } from 'mocha-typescript';
import { join } from 'path';
import * as snapshot from 'snap-shot-it';
import { MarkdownFileEmitter } from '../src';

@suite
class MarkdownFileEmitterTests {
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
        fileOrFolderExists(path: string): boolean {
          return false;
        },
        isFolder(path: string): boolean {
          return true;
        },
        isFile(path: string): boolean {
          return true;
        },
        // tslint:disable-next-line:no-empty
        async removeFolderAndContents(name: string): Promise<void> {},
        // tslint:disable-next-line:no-empty
        createFolder(name: string): void {},
        writeFileSync(filePath: string, contents: string): void {
          writeParams.push([filePath, contents]);
        }
      }
    });
    mfe.generate({
      types: {},
      symbols: {},
      sourceFiles: {
        foo: {
          name: 'foo/bar',
          pathInPackage: 'src/foo/bar',
          extension: 'ts',
          moduleName: 'foo',
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
    snapshot('file name', writeParams[0][0]);
    snapshot('file contents', writeParams[0][1].replace(/`/g, '\\`'));
  }
}
