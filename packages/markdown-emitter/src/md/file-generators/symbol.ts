import { LinkedFormattedSymbol } from '@code-to-json/formatter-linker';
import { inlineCode, rootWithTitle } from 'mdast-builder';
import { Node } from 'unist';
import { FileEmitterWorkspace, EmitterState } from '@snap-doc/emitter';
import { mdForSymbol } from '../utils/symbol';
import { addToc } from '../utils/toc';

export function markdownForSymbolFile(
  state: EmitterState,
  workspace: FileEmitterWorkspace,
  sym: LinkedFormattedSymbol,
): Node {
  const rootNode = rootWithTitle(1, inlineCode(sym.text || sym.name));
  rootNode.children.push(
    ...mdForSymbol(state, workspace, sym, sym, {
      includeDetails: true,
      includeTitle: false,
    }),
  );
  addToc(rootNode);
  return rootNode;
}
