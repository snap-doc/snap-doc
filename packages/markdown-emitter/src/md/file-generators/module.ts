import { LinkedFormattedSourceFile, LinkedFormattedSymbol } from '@code-to-json/formatter-linker';
import { isDefined } from '@code-to-json/utils';
import { Dict } from '@mike-north/types';
import { SortedExportSymbols, sortSymbols } from '@snap-doc/core';
import { heading, inlineCode, rootWithTitle, text } from 'mdast-builder';
import { Node } from 'unist';
import { FileEmitterWorkspace, EmitterState } from '@snap-doc/emitter';
import { createDocumentationForCommentData } from '../utils/comment-data';
import { mdForSymbol } from '../utils/symbol';
import { addToc } from '../utils/toc';

export interface MarkdownGenOptions {
  omitToc: boolean;
  detailedModules: boolean;
}

export type ExportKind = 'class' | 'property' | 'type' | 'function';

interface ExportSectionOptions {
  summarizeOnly: boolean;
  headerUrlFactory?: (sym: LinkedFormattedSymbol) => string;
}

function createExportSection(
  state: EmitterState,
  w: FileEmitterWorkspace,
  sectionName: string,
  filePath: string,
  symCollection: Dict<LinkedFormattedSymbol>,
  { summarizeOnly }: ExportSectionOptions,
): Node[] {
  const symbols = Object.keys(symCollection)
    .sort()
    .map(name => symCollection[name]);
  if (symbols.length === 0) {
    return [];
  }
  const parts: Node[] = symbols.reduce(
    (all, sym) => {
      if (!sym) {
        return all;
      }
      all.push(
        ...mdForSymbol(state, w, sym, {
          includeTitle: true,
          includeDetails: !summarizeOnly,
          baseDepth: 4,
          path: filePath,
        }),
      );
      return all;
    },
    [] as Node[],
  );

  const secRoot = [heading(3, text(sectionName)), ...parts];
  return secRoot;
}

export function createExportSections(
  state: EmitterState,
  w: FileEmitterWorkspace,
  { classes, properties, types, functions }: SortedExportSymbols,
  filePath: string,
  options: MarkdownGenOptions,
): Node[] {
  const parts: Node[] = [
    ...createExportSection(state, w, 'Properties', filePath, properties, { summarizeOnly: false }),
    ...createExportSection(state, w, 'Functions', filePath, functions, { summarizeOnly: false }),
    ...createExportSection(state, w, 'Types', filePath, types, {
      summarizeOnly: !options.detailedModules,
      headerUrlFactory: (sym: LinkedFormattedSymbol) =>
        w.host.pathRelativeTo(w.host.combinePaths(filePath, '..'), w.pathFor(state, sym)),
    }),
    ...createExportSection(state, w, 'Classes', filePath, classes, {
      summarizeOnly: !options.detailedModules,
      headerUrlFactory: (sym: LinkedFormattedSymbol) =>
        w.host.pathRelativeTo(w.host.combinePaths(filePath, '..'), w.pathFor(state, sym)),
    }),
  ];
  const secRoot = [heading(2, text('Exports')), ...parts];
  return secRoot;
}

/**
 * Create documentation markdown text for a file
 * @param file file to document
 * @private
 */
export function markdownForSourceFile(
  state: EmitterState,
  workspace: FileEmitterWorkspace,
  file: LinkedFormattedSourceFile,
  options: MarkdownGenOptions = { omitToc: false, detailedModules: false },
  symbolsToSerialize: { classes: LinkedFormattedSymbol[]; types: LinkedFormattedSymbol[] },
): Node {
  const { documentation, symbol } = file;
  const rootNode = rootWithTitle(1, inlineCode(file.moduleName));

  if (!symbol) {
    throw new Error(`File ${file.path} is not associated with a symbol`);
  }
  const { exports: exportSymbols } = symbol;
  rootNode.children.push(...createDocumentationForCommentData(documentation));
  if (exportSymbols && Object.keys(exportSymbols).length > 0) {
    const sortedExports: SortedExportSymbols = sortSymbols(exportSymbols);
    const filePath = workspace.pathFor(state, file);
    rootNode.children.push(
      ...createExportSections(state, workspace, sortedExports, filePath, options),
    );
    symbolsToSerialize.classes.push(
      ...Object.keys(sortedExports.classes)
        .map(k => sortedExports.classes[k])
        .filter(isDefined),
    );
    symbolsToSerialize.types.push(
      ...Object.keys(sortedExports.types)
        .map(k => sortedExports.types[k])
        .filter(isDefined),
    );
  }

  if (!options.omitToc) {
    addToc(rootNode);
  }
  return rootNode;
}
