import { DocDataFile } from '@snap-doc/types';
import { expect } from 'chai';
import { suite, test } from 'mocha-typescript';
import * as snapshot from 'snap-shot-it';

import { CommentBlockTag, CommentFencedCode } from '@code-to-json/comments';
import {
  createSection,
  createSourceFileRoot,
  createTagsTable,
  markdownForDocFile,
  organizeTags,
  parseDocumentation,
  parseParagraphContent
} from '../src/md/utils';

@suite('markdown utilities tests')
class MarkdownUtilsTests {
  @test
  public 'create root AST node from source root'(): void {
    snapshot(
      createSourceFileRoot({
        name: 'foo',
        pathInPackage: 'src/foo'
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
      markdownForDocFile({
        name: 'foo/bar',
        pathInPackage: 'src/foo/bar'
      })
    ).to.eql(`# foo/bar

\`src/foo/bar\``);
  }

  @test
  public 'markdownForDocFile - with documentation'(): void {
    expect(
      markdownForDocFile({
        name: 'foo/bar',
        pathInPackage: 'src/foo/bar',
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
      } as DocDataFile)
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
      markdownForDocFile({
        name: 'foo/bar',
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
      } as DocDataFile)
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
