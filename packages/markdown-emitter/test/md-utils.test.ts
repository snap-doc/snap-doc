import { expect } from 'chai';
import { suite, test } from 'mocha-typescript';
import * as snapshot from 'snap-shot-it';
import {
  createTagsTable,
  organizeTags,
  parseDocumentation,
  parseParagraphContent
} from '../src/md/utils/comment-data';
import { createSourceFileRoot } from '../src/md/utils/file';
import { createSection } from '../src/md/utils/section';

@suite
export class MarkdownUtilsTests {
  @test
  public 'create root AST node from source root'(): void {
    snapshot(
      createSourceFileRoot({
        id: '',
        moduleName: 'foo',
        kind: 'sourceFile',
        path: 'src/foo',
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
}
