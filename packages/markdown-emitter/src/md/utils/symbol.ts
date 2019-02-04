import { LinkedFormattedSymbol } from '@code-to-json/formatter-linker';
import { Node } from 'unist';
import { createDocumentation } from './documentation';
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

function sectionHeaderForSymbol(s: LinkedFormattedSymbol): Node {
  const { flags } = s;
  if (!flags) {
    throw new Error('symbol had no flags');
  }
  if (
    flags.includes('variable') ||
    flags.includes('typeAlias') ||
    flags.includes('typeLiteral') ||
    flags.includes('interface') ||
    flags.includes('class')
  ) {
    return { type: 'inlineCode', value: s.name };
  } else if (flags.includes('function')) {
    return { type: 'inlineCode', value: `${s.name}(...)` };
  } else {
    throw new Error(`Should not receive symbol with flags ${flags.join(', ')}`);
  }
}

export function mdForSymbol(s: LinkedFormattedSymbol): Node[] {
  const parts: Node[] = [];
  const { documentation } = s;
  parts.push(...createDocumentation(documentation));
  parts.push(symbolTypeDescription(s));
  return createSection(4, sectionHeaderForSymbol(s), parts);
}
