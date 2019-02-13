import {
  LinkedFormattedOutputData,
  LinkedFormattedSourceFile,
  LinkedFormattedSymbol
} from '@code-to-json/formatter-linker';
import { isDefined } from '@code-to-json/utils';
import { Dict } from '@mike-north/types';
import { SortedExportSymbols, sortSymbols } from '@snap-doc/core';
import { DocEnvLike } from '@snap-doc/types';
import { Node } from 'unist';
import md from '../index';
import { createDocumentationForCommentData } from './comment-data';
import { createSourceFileRoot } from './file';
import { createSection } from './section';
import { mdForSymbol } from './symbol';
import { addToc } from './toc';

export interface MarkdownGenOptions {
  omitToc: boolean;
}

export type ExportKind = 'class' | 'property' | 'type' | 'function';

interface ExportSectionOptions {
  summarizeOnly: boolean;
  headerUrlFactory?: (name: string) => string;
}

function createExportSection(
  sectionName: string,
  symCollection: Dict<LinkedFormattedSymbol>,
  { summarizeOnly, headerUrlFactory }: ExportSectionOptions
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
        all.push(
          ...mdForSymbol(sym, {
            includeTypeInformation: !summarizeOnly,
            headerUrlFactory
          })
        );
        return all;
      },
      [] as Node[]
    )
  );
  const secRoot = createSection(3, sectionName, parts);
  return secRoot;
}

export function createExportSections(
  { classes, properties, types, functions }: SortedExportSymbols,
  _filePath: string,
  _env: DocEnvLike
): Node[] {
  const parts: Node[] = [
    ...createExportSection('Properties', properties, { summarizeOnly: false }),
    ...createExportSection('Functions', functions, { summarizeOnly: false }),
    ...createExportSection('Types', types, {
      summarizeOnly: true,
      headerUrlFactory: (tname: string) => `./types/${tname.replace(/\"/g, '').trim()}.md`
    }),
    ...createExportSection('Classes', classes, {
      summarizeOnly: true,
      headerUrlFactory: (cname: string) => `./classes/${cname.replace(/\"/g, '').trim()}.md`
    })
  ];
  const secRoot = createSection(2, 'Exports', parts);
  return secRoot;
}

/**
 * Create documentation markdown text for a file
 * @param file file to document
 * @private
 */
export function markdownForSourceFile(
  data: LinkedFormattedOutputData,
  file: LinkedFormattedSourceFile,
  env: DocEnvLike,
  options: MarkdownGenOptions = { omitToc: false },
  symbolsToSerialize: { classes: LinkedFormattedSymbol[]; types: LinkedFormattedSymbol[] }
): string {
  const { documentation, symbol } = file;
  const root = createSourceFileRoot(file);
  if (!symbol) {
    throw new Error(`File ${file.path} is not associated with a symbol`);
  }
  const { exports: exportSymbols } = symbol;
  root.children.push(...createDocumentationForCommentData(documentation));
  if (exportSymbols && Object.keys(exportSymbols).length > 0) {
    const sortedExports: SortedExportSymbols = sortSymbols(data, exportSymbols);
    const filePath = env.pathHelper.pathForSlug('module', file.path);
    root.children.push(...createExportSections(sortedExports, filePath, env));
    symbolsToSerialize.classes.push(
      ...Object.keys(sortedExports.classes)
        .map(k => sortedExports.classes[k])
        .filter(isDefined)
    );
    symbolsToSerialize.types.push(
      ...Object.keys(sortedExports.types)
        .map(k => sortedExports.types[k])
        .filter(isDefined)
    );
  }

  if (!options.omitToc) {
    addToc(root);
  }
  return md.stringify(root).trim();
}
