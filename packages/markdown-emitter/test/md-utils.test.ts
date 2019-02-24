import * as snapshot from 'snap-shot-it';
import { describe, it } from 'mocha';
import { createTagsTable, organizeTags, parseParagraphContent } from '../src/md/utils/comment-data';

describe('Markdown utils tests', () => {
  it('parseParagraphContent simple text list', () => {
    snapshot(parseParagraphContent(['hello simple', '\n', 'content']));
  });
  it('createTagsTable - no rows', () => {
    snapshot(createTagsTable('Favorite Flavors', []));
  });
  it('createTagsTable - with rows', () => {
    snapshot(
      createTagsTable('Important Information', [
        ['author', [{ type: 'text', value: 'Mike' }]],
        ['note', [{ type: 'text', value: 'Read this carefully!' }]],
      ]),
    );
  });
  it('organizeTags tests', () => {
    snapshot(
      organizeTags([
        ['author', [{ type: 'text', value: 'Mike' }]],
        ['note', [{ type: 'text', value: 'Read this carefully!' }]],
      ]),
    );
  });
});
