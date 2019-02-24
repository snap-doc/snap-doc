import { expect } from 'chai';
import { suite, test } from 'mocha-typescript';
import * as snapshot from 'snap-shot-it';
import { createTagsTable, organizeTags, parseParagraphContent } from '../src/md/utils/comment-data';

@suite
export class MarkdownUtilsTests {
  @test
  public 'parseParagraphContent simple text list'(): void {
    snapshot(parseParagraphContent(['hello simple', '\n', 'content']));
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
        ['note', [{ type: 'text', value: 'Read this carefully!' }]],
      ]),
    );
  }
  @test
  public 'organizeTags tests'(): void {
    snapshot(
      organizeTags([
        ['author', [{ type: 'text', value: 'Mike' }]],
        ['note', [{ type: 'text', value: 'Read this carefully!' }]],
      ]),
    );
  }
}
