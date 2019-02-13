import { LinkedFormattedOutputData, LinkedFormattedSymbol } from '@code-to-json/formatter-linker';
import { Node } from 'unist';
import md from '../index';
import { createDocumentationForCommentData } from './comment-data';
import { createSourceFileRoot } from './file';
import { createSection } from './section';

function symbolTypeDescription(symbol: LinkedFormattedSymbol): Node {
  return {
    type: 'paragraph',
    children: [{ type: 'code', lang: 'ts', value: symbolTypeDescriptionCode(symbol) }]
  };
}

function symbolTypeDescriptionCode(symbol: LinkedFormattedSymbol): string | undefined {
  const { flags } = symbol;
  if (!flags) {
    return undefined;
  }
  const parts: string[] = [];
  if (symbol.type) {
    parts.push(symbol.type.text);
  }
  if (symbol.valueType) {
    parts.push(symbol.valueType.text);
  }
  if (parts.length === 0) {
    return undefined;
  }
  return parts.join('\n');
}

function sectionHeaderForSymbol(
  s: LinkedFormattedSymbol,
  opts: {
    headerUrlFactory?: (name: string) => string;
  } = {}
): Node {
  const { flags } = s;
  if (!flags) {
    throw new Error('symbol had no flags');
  }
  if (
    flags.includes('variable') ||
    flags.includes('typeAlias') ||
    flags.includes('typeLiteral') ||
    flags.includes('interface') ||
    flags.includes('class') ||
    flags.includes('function')
  ) {
    const value = s.text || s.name;
    const content = { type: 'inlineCode', value };
    if (opts.headerUrlFactory) {
      return {
        type: 'link',
        url: opts.headerUrlFactory(value),
        title: value,
        children: [content]
      };
    } else {
      return content;
    }
  } else {
    throw new Error(`Should not receive symbol with flags ${flags.join(', ')}`);
  }
}

export interface MDSymbolOptions {
  includeTypeInformation: boolean;
  headerUrlFactory?: (name: string) => string;
}

export function mdForSymbol(s: LinkedFormattedSymbol, opts: MDSymbolOptions): Node[] {
  const parts: Node[] = [];
  const { documentation } = s;
  parts.push(...createDocumentationForCommentData(documentation));
  if (opts.includeTypeInformation) {
    parts.push(symbolTypeDescription(s));
  }
  return createSection(
    4,
    sectionHeaderForSymbol(s, {
      headerUrlFactory: opts.headerUrlFactory
    }),
    parts
  );
}
export function markdownForSymbolFile(
  _data: LinkedFormattedOutputData,
  sym: LinkedFormattedSymbol
): string {
  const root = createSourceFileRoot(sym);

  root.children.push(...mdForSymbol(sym, { includeTypeInformation: true }));

  return md.stringify(root).trim();
}
