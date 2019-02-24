import { LinkedFormattedSignature, LinkedFormattedSymbol } from '@code-to-json/formatter-linker';
import { blockquote, brk, inlineCode, paragraph, text } from 'mdast-builder';
import { Node } from 'unist';
import { createDocumentationForCommentData } from './comment-data';

export function mdSignatures(
  sym: LinkedFormattedSymbol,
  sigs?: LinkedFormattedSignature[],
): Node[] {
  if (!sigs || sigs.length === 0) {
    return [];
  }
  const parts: Node[] = sigs.map(cs => {
    const { documentation } = cs;
    const sigKids: Node[] = [];

    sigKids.push(paragraph([cs.text ? inlineCode(cs.text) : text('')]));
    if (
      documentation &&
      documentation.summary &&
      // if this signature's documentation is already being used for the symbol, do not
      // list it twice
      (!sym.documentation ||
        JSON.stringify(documentation.summary) !== JSON.stringify(sym.documentation.summary))
    ) {
      sigKids.push(brk, blockquote(paragraph(createDocumentationForCommentData(documentation))));
    }

    return paragraph(sigKids);
  });

  return parts;
}
