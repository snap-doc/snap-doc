import { LinkedFormattedSourceFile, LinkedFormattedSymbol } from '@code-to-json/formatter-linker';
import { isDefined } from '@code-to-json/utils';
import { Dict } from '@mike-north/types';
import { SortedExportSymbols, sortSymbols } from '@snap-doc/core';
import { heading, inlineCode, rootWithTitle, text, paragraph, link } from 'mdast-builder';
import { Node } from 'unist';
import { FileEmitterWorkspace } from '@snap-doc/emitter';
import { resolveAlias } from '@snap-doc/utils';
import { createDocumentationForCommentData } from '../utils/comment-data';
import { mdForSymbol } from '../utils/symbol';
import { addToc } from '../utils/toc';
import MarkdownEmitterState from '../../emitter/state';

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
  state: MarkdownEmitterState,
  w: FileEmitterWorkspace,
  sectionName: string,
  symCollection: Dict<LinkedFormattedSymbol>,
  file: LinkedFormattedSourceFile,
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

      const resolvedSym = resolveAlias(sym);
      const { sourceFile } = resolvedSym;
      if (!sourceFile || sourceFile.id === file.id) {
        all.push(
          ...mdForSymbol(state, w, sym, file, {
            includeTitle: true,
            includeDetails: !summarizeOnly,
            baseDepth: 4,
          }),
        );
      } else {
        all.push(
          heading(
            4,
            link(
              w.relativePath(state, file, resolvedSym, 'md'),
              resolvedSym.text || resolvedSym.name,
              inlineCode(resolvedSym.text || resolvedSym.name),
            ),
          ),
          paragraph([
            text('re-export of symbol '),
            link(
              w.relativePath(state, file, resolvedSym, 'md'),
              resolvedSym.name,
              inlineCode(resolvedSym.name),
            ),
            text(' from '),
            link(
              w.relativePath(state, file, sourceFile, 'md'),
              sourceFile.moduleName,
              inlineCode(sourceFile.moduleName),
            ),
          ]),
        );
      }
      return all;
    },
    [] as Node[],
  );

  const secRoot = [heading(3, text(sectionName)), ...parts];
  return secRoot;
}

export function createExportSections(
  state: MarkdownEmitterState,
  w: FileEmitterWorkspace,
  { classes, properties, types, functions }: SortedExportSymbols,
  file: LinkedFormattedSourceFile,
  options: MarkdownGenOptions,
): Node[] {
  const parts: Node[] = [
    ...createExportSection(state, w, 'Properties', properties, file, { summarizeOnly: false }),
    ...createExportSection(state, w, 'Functions', functions, file, { summarizeOnly: false }),
    ...createExportSection(state, w, 'Types', types, file, {
      summarizeOnly: !options.detailedModules,
    }),
    ...createExportSection(state, w, 'Classes', classes, file, {
      summarizeOnly: !options.detailedModules,
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
  state: MarkdownEmitterState,
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
    rootNode.children.push(...createExportSections(state, workspace, sortedExports, file, options));
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
