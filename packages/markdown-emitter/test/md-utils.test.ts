import { expect } from 'chai';
import { suite, test } from 'mocha-typescript';
import * as snapshot from 'snap-shot-it';

import { CommentBlockTag, CommentFencedCode } from '@code-to-json/comments';
import { createSourceFileRoot, markdownForDocFile } from '../src/md/utils';
import {
  createTagsTable,
  organizeTags,
  parseDocumentation,
  parseParagraphContent
} from '../src/md/utils/documentation';
import { createSection } from '../src/md/utils/section';

@suite('markdown utilities tests')
class MarkdownUtilsTests {
  @test
  public 'create root AST node from source root'(): void {
    snapshot(
      createSourceFileRoot({
        name: 'foo',
        moduleName: 'foo',
        pathInPackage: 'src/foo',
        extension: 'ts',
        isDeclarationFile: false
      })
    );
  }

  @test
  public 'parseParagraphContent simple text list'(): void {
    snapshot(parseParagraphContent(['hello simple', '\n', 'content']));
  }

  @test
  public 'parseDocumentation - summary nodes'(): void {
    const { summary } = parseDocumentation({
      summary: ['hey, show me some examples']
    });
    snapshot(summary);
  }

  @test
  public 'parseDocumentation - code block'(): void {
    const { summary } = parseDocumentation({
      summary: [
        'This is a simple comment',
        {
          kind: 'fencedCode',
          language: 'ts',
          code: 'function foo() {}'
        }
      ]
    });
    snapshot(summary);
  }
  @test
  public 'parseDocumentation - no documentation'(): void {
    const { summary, headerTags } = parseDocumentation();

    expect(summary).to.deep.eq([]);
    expect(headerTags).to.deep.eq([]);
  }

  @test
  public 'parseDocumentation - custom tags'(): void {
    const { summary } = parseDocumentation({
      summary: ['hello tags'],
      customTags: [
        {
          kind: 'blockTag' as 'blockTag',
          tagName: 'author',
          content: ['Mike']
        }
      ]
    });
    snapshot(summary);
  }

  @test
  public 'createSection tests'(): void {
    snapshot(createSection(1, 'My Title', []));
  }

  @test
  public 'createTagsTable - no rows'(): void {
    snapshot(createTagsTable('Favorite Flavors', []));
  }

  @test
  public 'createTagsTable - with rows'(): void {
    snapshot(
      createTagsTable('Important Information', [
        ['author', [{ type: 'text', value: 'Mike' }]],
        ['note', [{ type: 'text', value: 'Read this carefully!' }]]
      ])
    );
  }

  @test
  public 'organizeTags tests'(): void {
    snapshot(
      organizeTags([
        ['author', [{ type: 'text', value: 'Mike' }]],
        ['note', [{ type: 'text', value: 'Read this carefully!' }]]
      ])
    );
  }

  @test
  public 'markdownForDocFile - no documentation'(): void {
    expect(
      markdownForDocFile(
        { sourceFiles: {}, symbols: {}, types: {} },
        {
          name: 'foo/bar',
          extension: 'ts',
          moduleName: 'bar',
          isDeclarationFile: false,
          pathInPackage: 'src/foo/bar'
        }
      )
    ).to.eql(`# foo/bar

  \`src/foo/bar\``);
  }

  @test
  public 'markdownForDocFile - with documentation'(): void {
    expect(
      markdownForDocFile(
        { sourceFiles: {}, symbols: {}, types: {} },
        {
          name: 'foo/bar',
          pathInPackage: 'src/foo/bar',
          extension: 'ts',
          moduleName: 'bar',
          isDeclarationFile: false,
          documentation: {
            summary: ['My favorite module'],
            customTags: [
              {
                kind: 'blockTag',
                tagName: 'author',
                content: ['Mike']
              }
            ]
          }
        }
      )
    ).to.eql(`# foo/bar

  \`src/foo/bar\`

  | Information |      |
  | :---------- | :--: |
  | **author**  | Mike |

  My favorite module`);
  }

  @test
  public 'markdownForDocFile - with examples'(): void {
    expect(
      markdownForDocFile(
        { sourceFiles: {}, symbols: {}, types: {} },
        {
          name: 'foo/bar',
          extension: 'ts',
          moduleName: 'bar',
          isDeclarationFile: false,
          pathInPackage: 'src/foo/bar',
          documentation: {
            summary: ['My favorite module'],
            customTags: [
              {
                kind: 'blockTag',
                tagName: 'author',
                content: ['Mike']
              },
              {
                kind: 'blockTag',
                tagName: 'foobar',
                content: ['Baz']
              },
              {
                kind: 'blockTag',
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
      )
    ).to.eql(`# foo/bar

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
