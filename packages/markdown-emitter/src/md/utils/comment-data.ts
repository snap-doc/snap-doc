import {
  CommentData,
  CommentFencedCode,
  CommentParagraphContent,
  CommentParam,
} from '@code-to-json/comments';
import {
  brk,
  code,
  emphasis,
  inlineCode,
  list,
  listItem,
  paragraph,
  strong,
  table,
  tableCell,
  tableRow,
  text,
} from 'mdast-builder';
import { Node, Parent } from 'unist';
import md from '../index';
import { bannerNode } from './banner';
import { removePositionInformation } from './node-utils';

type BlockTag = [string, Node[]];
const SOURCEFILE_HEADER_TOP_TAGS: string[] = ['author', 'file'];

/**
 *
 * @param tags
 * @internal
 */
export function organizeTags(
  tags: BlockTag[],
): { top: BlockTag[]; examples: BlockTag[]; other: BlockTag[] } {
  const top: BlockTag[] = [];
  const examples: BlockTag[] = [];
  const other: BlockTag[] = [];
  tags.forEach(t => {
    const name = t[0];
    // eslint-disable-next-line no-nested-ternary
    const lst = SOURCEFILE_HEADER_TOP_TAGS.includes(name)
      ? top
      : name === 'example'
      ? examples
      : other;
    lst.push(t);
  });
  return { top, examples, other };
}

/**
 *
 * @param title
 * @param tags
 * @internal
 */
export function createTagsTable(title: string, tags: BlockTag[]): Node {
  return table(['left', 'center'], () => [
    tableRow([tableCell(text(title))]),
    ...tags.map(t => {
      return tableRow([tableCell(strong(text(t[0]))), tableCell(t[1])]);
    }),
  ]);
}

/**
 * Convert a CommentParagraphContent into a list of mdast Nodes
 * @param summary
 * @internal
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
      parts.push(brk, code(c.language, c.code.trim()), brk);
    } else {
      throw new Error(`Unexpected item in paragraph content
${JSON.stringify(item)}`);
    }
  });
  return parts;
}

function mdParamsList(params?: CommentParam[]): Node | null {
  if (!params) {
    return null;
  }
  const paramTags: Node[] = params.map(param => {
    const { content, name, type } = param;
    return listItem(
      paragraph(() => {
        const parts: Node[] = [strong(text(name || '(unknown param name)'))];
        if (type) {
          parts.push(text(': '), inlineCode(type));
        }
        if (content) {
          parts.push(text(' - '), ...parseParagraphContent(content));
        }
        return parts;
      }),
    );
  });

  return list('unordered', paramTags);
}

const DEFAULT_DEPRECATION_CONTENT = [
  paragraph(text('This has been deprecated, and may be removed in a future release.')),
];
function mdDeprecationNotice(content?: CommentParagraphContent): Node {
  const noticeContent: Node[] = content
    ? parseParagraphContent(content)
    : DEFAULT_DEPRECATION_CONTENT;
  if (noticeContent.length === 0) {
    noticeContent.push(...DEFAULT_DEPRECATION_CONTENT);
  }
  return bannerNode('Deprecation Warning', noticeContent, { emoji: 'deprecation' });
}

export function createDocumentationForCommentData(documentation?: CommentData): Node[] {
  if (!documentation) {
    return [];
  }
  const { summary, customTags, params, typeParams, deprecated, modifiers } = documentation;
  const headerTags: BlockTag[] = [];
  const parts: Node[] = [];
  if (modifiers) {
    const filteredModifiers = modifiers.filter(
      m => ['public', 'private', 'protected'].indexOf(m) < 0,
    );
    if (filteredModifiers.length > 0) {
      parts.push(...filteredModifiers.map(m => emphasis(text(m))), brk);
    }
  }
  if (deprecated) {
    parts.push(mdDeprecationNotice(deprecated));
  }
  if (customTags) {
    customTags.forEach(tag => {
      const { tagName, content } = tag;
      if (content && ['example', 'doctest'].indexOf(tagName) >= 0) {
        headerTags.push([tagName, [code('typescript', content.join(''))]]);
      } else {
        headerTags.push([tagName, content ? parseParagraphContent(content) : []]);
      }
    });
  }

  const { top, examples, other } = organizeTags(headerTags);
  parts.push(...parseParagraphContent(summary));
  const paramsList = mdParamsList(params);
  if (paramsList) {
    parts.push(brk, paramsList, brk);
  }

  const typeParamsList = mdParamsList(typeParams);
  if (typeParamsList) {
    parts.push(brk, typeParamsList, brk);
  }
  if (top.length > 0) {
    parts.push(brk, createTagsTable('Information', top), brk);
  }
  if (examples.length > 0) {
    parts.push(
      brk,
      paragraph(
        examples.map(e => ({
          type: 'paragraph',
          children: e[1],
        })),
      ),
    );
  }
  if (other.length > 0) {
    parts.push(createTagsTable('Other Details', other));
    parts.push(brk);
  }
  return parts;
}
