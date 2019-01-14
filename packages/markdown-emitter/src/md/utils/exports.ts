import { FormattedSymbol } from '@code-to-json/formatter';
import { FormatterOutputData } from '@code-to-json/formatter/lib/src/formatter';
import { Dict } from '@mike-north/types';
import { SortedExportSymbols } from '@snap-doc/core';
import { Node } from 'unist';
import { createSection } from './section';
import { mdForSymbol } from './symbol';

export type ExportKind = 'class' | 'property' | 'type' | 'function';

function createExportSection(
  data: FormatterOutputData,
  sectionName: string,
  symCollection: Dict<FormattedSymbol>,
  kind: ExportKind
): Node[] {
  const symbols = Object.keys(symCollection)
    .sort()
    .map(name => symCollection[name]);
  const parts: Node[] = [];
  if (symbols.length === 0) {
    parts.push({ type: 'text', value: 'todo' });
  } else {
    parts.push(
      ...symbols.reduce(
        (all, sym) => {
          if (!sym) { return all; }
          all.push(...mdForSymbol(data, sym, kind));
          return all;
        },
        [] as Node[]
      )
    );
  }
  const secRoot = createSection(3, sectionName, parts);
  return secRoot;
}

export function createExportSections(
  data: FormatterOutputData,
  { classes, properties, types, functions }: SortedExportSymbols
): Node[] {
  const parts: Node[] = [
    ...createExportSection(data, 'Properties', properties, 'property'),
    ...createExportSection(data, 'Types', types, 'type'),
    ...createExportSection(data, 'Classes', classes, 'class'),
    ...createExportSection(data, 'Functions', functions, 'function')
  ];
  const secRoot = createSection(2, 'Exports', parts);
  return secRoot;
}
