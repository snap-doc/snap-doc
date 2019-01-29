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
  symCollection: Dict<FormattedSymbol>
): Node[] {
  const symbols = Object.keys(symCollection)
    .sort()
    .map(name => symCollection[name]);
  if (symbols.length === 0) {
    return [];
  }
  const parts: Node[] = [];
  parts.push(
    ...symbols.reduce(
      (all, sym) => {
        if (!sym) {
          return all;
        }
        all.push(...mdForSymbol(data, sym));
        return all;
      },
      [] as Node[]
    )
  );
  const secRoot = createSection(3, sectionName, parts);
  return secRoot;
}

export function createExportSections(
  data: FormatterOutputData,
  { classes, properties, types, functions }: SortedExportSymbols
): Node[] {
  const parts: Node[] = [
    ...createExportSection(data, 'Properties', properties),
    ...createExportSection(data, 'Types', types),
    ...createExportSection(data, 'Classes', classes),
    ...createExportSection(data, 'Functions', functions)
  ];
  const secRoot = createSection(2, 'Exports', parts);
  return secRoot;
}
