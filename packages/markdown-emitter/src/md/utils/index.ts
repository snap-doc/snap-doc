import {
  LinkedFormattedOutputData,
  LinkedFormattedSourceFile
} from '@code-to-json/formatter-linker';
import { SortedExportSymbols, sortSymbols } from '@snap-doc/core';
import { Parent } from 'unist';
import md from '../index';
import { createDocumentation } from './documentation';
import { createExportSections } from './exports';
import { addToc } from './toc';

/**
 * Create a source root node and initial children for a file
 * @param f file
 * @private
 */
export function createSourceFileRoot(f: LinkedFormattedSourceFile): Parent {
  const { moduleName, path } = f;
  return {
    type: 'root',
    children: [
      {
        type: 'heading',
        depth: 1,
        children: [
          {
            type: 'text',
            value: moduleName
          }
        ]
      },
      {
        type: 'inlineCode',
        value: path
      }
    ]
  };
}

export interface MarkdownGenOptions {
  omitToc: boolean;
}

/**
 * Create documentation markdown text for a file
 * @param file file to document
 * @private
 */
export function markdownForDocFile(
  data: LinkedFormattedOutputData,
  file: LinkedFormattedSourceFile,
  options: MarkdownGenOptions = { omitToc: false }
): string {
  const { documentation, symbol } = file;
  const root = createSourceFileRoot(file);
  if (!symbol) {
    throw new Error(`File ${file.path} is not associated with a symbol`);
  }
  const { exports: exportSymbols } = symbol;
  root.children.push(...createDocumentation(documentation));
  if (exportSymbols && Object.keys(exportSymbols).length > 0) {
    const sortedExports: SortedExportSymbols = sortSymbols(data, exportSymbols);
    root.children.push(...createExportSections(sortedExports));
  }
  if (!options.omitToc) {
    addToc(root);
  }
  return md.stringify(root).trim();
}
