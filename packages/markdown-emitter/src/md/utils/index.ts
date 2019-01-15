import { FormattedSourceFile, FormatterOutputData } from '@code-to-json/formatter';
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
export function createSourceFileRoot(f: FormattedSourceFile): Parent {
  const { name, pathInPackage } = f;
  return {
    type: 'root',
    children: [
      {
        type: 'heading',
        depth: 1,
        children: [
          {
            type: 'text',
            value: name
          }
        ]
      },
      {
        type: 'inlineCode',
        value: pathInPackage
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
  data: FormatterOutputData,
  file: FormattedSourceFile,
  options: MarkdownGenOptions = { omitToc: false }
): string {
  const { documentation, exports } = file;
  const root = createSourceFileRoot(file);
  root.children.push(...createDocumentation(documentation));
  if (exports && Object.keys(exports).length > 0) {
    const sortedExports: SortedExportSymbols = sortSymbols(data, exports);
    root.children.push(...createExportSections(data, sortedExports));
  }
  if (!options.omitToc) {
    addToc(root);
  }
  return md.stringify(root).trim();
}
