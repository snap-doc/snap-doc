import { LinkedFormattedSymbol } from '@code-to-json/formatter-linker';
import { Dict } from '@mike-north/types';
import { SortedExportSymbols } from '@snap-doc/core';
import { Node } from 'unist';
import { createSection } from './section';
import { mdForSymbol } from './symbol';

export type ExportKind = 'class' | 'property' | 'type' | 'function';

function createExportSection(
  sectionName: string,
  symCollection: Dict<LinkedFormattedSymbol>
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
        all.push(...mdForSymbol(sym));
        return all;
      },
      [] as Node[]
    )
  );
  const secRoot = createSection(3, sectionName, parts);
  return secRoot;
}

export function createExportSections({
  classes,
  properties,
  types,
  functions
}: SortedExportSymbols): Node[] {
  const parts: Node[] = [
    ...createExportSection('Properties', properties),
    ...createExportSection('Types', types),
    ...createExportSection('Classes', classes),
    ...createExportSection('Functions', functions)
  ];
  const secRoot = createSection(2, 'Exports', parts);
  return secRoot;
}
