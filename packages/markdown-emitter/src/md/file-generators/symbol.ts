import { LinkedFormattedSymbol } from '@code-to-json/formatter-linker';
import { inlineCode, rootWithTitle } from 'mdast-builder';
import { Node } from 'unist';
import { mdForSymbol } from '../utils/symbol';
import { addToc } from '../utils/toc';
import MarkdownFileEmitterWorkspace from '../../emitter/workspace';

export function markdownForSymbolFile(
  workspace: MarkdownFileEmitterWorkspace,
  sym: LinkedFormattedSymbol,
): Node {
  const rootNode = rootWithTitle(1, inlineCode(sym.text || sym.name));
  rootNode.children.push(
    ...mdForSymbol(workspace, sym, sym, {
      includeDetails: true,
      includeTitle: false,
    }),
  );
  addToc(rootNode);
  return rootNode;
}
