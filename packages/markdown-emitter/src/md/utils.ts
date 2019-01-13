import { CommentData, CommentFencedCode, CommentParagraphContent } from '@code-to-json/comments';
import { DocDataFile } from '@snap-doc/types';
import { Node, Parent } from 'unist';
import { removePositionInformation } from '../node-utils';
import md from './index';
import { addToc } from './toc';

const SOURCEFILE_HEADER_TOP_TAGS: string[] = ['author', 'file'];

type BlockTag = [string, Node[]];

/**
 * Convert a CommentParagraphContent into a list of mdast Nodes
 * @param summary
 * @private
 */
export function parseParagraphContent(summary: CommentParagraphContent): Node[] {
  const parts: Node[] = [];
  summary.forEach(item => {
    if (typeof item === 'string') {
      const parsedPart = (md.parse(item) as Parent).children;
      const sanitizedParsedPart = removePositionInformation(parsedPart);
      parts.push(...sanitizedParsedPart);
    } else if (item.kind === 'fencedCode') {
      const c: CommentFencedCode = item;
      parts.push({
        type: 'paragraph',
        children: [
          { type: 'text', value: '\n' },
          { type: 'code', lang: c.language, value: c.code.trim() },
          { type: 'text', value: '\n' }
        ]
      });
    } else {
      throw new Error(`Unexpected item in paragraph content
${JSON.stringify(item)}`);
    }
  });
  return parts;
}

/**
 * Create a source root node and initial children for a file
 * @param f file
 * @private
 */
export function createSourceFileRoot(f: DocDataFile): Parent {
  const { name, pathInPackage } = f;
  return {
    type: 'root',
    children: [
      {
        type: 'heading',
        depth: 1,
        children: [
          {
            type: 'text',
            value: name
          }
        ]
      },
      {
        type: 'inlineCode',
        value: pathInPackage
      }
    ]
  };
}

/**
 * Parse the documentation property (i.e., code comment associated with the file) from a source file
 * @param f file
 * @private
 */
export function parseDocumentation(
  documentation?: CommentData
): {
  summary: Node[];
  headerTags: BlockTag[];
} {
  if (!documentation) {
    return { summary: [], headerTags: [] };
  }
  const { summary, customTags } = documentation;
  const headerTags: BlockTag[] = [];
  if (customTags) {
    customTags.forEach(tag => {
      const { tagName, content } = tag;
      headerTags.push([tagName, content ? parseParagraphContent(content) : []]);
    });
  }
  return {
    headerTags,
    summary: parseParagraphContent(summary)
  };
}

export function createTagsTable(title: string, tags: BlockTag[]): Node {
  const rows = tags.map(t => {
    return {
      type: 'tableRow',
      children: [
        {
          type: 'tableCell',
          children: [
            {
              type: 'strong',
              children: [{ type: 'text', value: t[0] }]
            }
          ]
        },
        {
          type: 'tableCell',
          children: t[1]
        }
      ]
    };
  });
  return {
    type: 'table',
    align: ['left', 'center'],
    children: [
      {
        type: 'tableRow',
        children: [
          {
            type: 'tableCell',
            children: [{ type: 'text', value: title }]
          }
        ]
      },
      ...rows
    ]
  };
}

export function organizeTags(
  tags: BlockTag[]
): { top: BlockTag[]; examples: BlockTag[]; other: BlockTag[] } {
  const top: BlockTag[] = [];
  const examples: BlockTag[] = [];
  const other: BlockTag[] = [];
  tags.forEach(t => {
    const name = t[0];
    const list = SOURCEFILE_HEADER_TOP_TAGS.includes(name)
      ? top
      : name === 'example'
      ? examples
      : other;
    list.push(t);
  });
  return { top, examples, other };
}

/**
 * Create a section
 * @param level depth of section (heading level)
 * @param title title of section
 * @param content content within section
 * @private
 */
export function createSection(level: number, title: string, content: Node[]): Node {
  return {
    type: 'paragraph',
    children: [
      {
        type: 'heading',
        depth: level,
        children: [{ type: 'text', value: title }, { type: 'text', value: '\n\n' }]
      },
      {
        type: 'paragraph',
        children: content
      }
    ]
  };
}

/**
 * Create documentation markdown text for a file
 * @param file file to document
 * @private
 */
export function markdownForDocFile(file: DocDataFile): string {
  const { documentation } = file;
  const root = createSourceFileRoot(file);
  const { headerTags, summary } = parseDocumentation(documentation);
  const { top, examples, other } = organizeTags(headerTags);
  if (top.length > 0) {
    root.children.push(createTagsTable('Information', top));
  }
  root.children.push(...summary);
  if (examples.length > 0) {
    root.children.push(
      createSection(
        2,
        'Examples',
        examples.map(e => ({
          type: 'paragraph',
          children: e[1]
        }))
      )
    );
  }
  if (other.length > 0) {
    root.children.push(createTagsTable('Other Details', other));
  }
  addToc(root);
  return md.stringify(root).trim();
}
