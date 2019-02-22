import { paragraph, strong, text } from 'mdast-builder';
import { Node } from 'unist';
import { EMOJI_MAP } from '../../emoji';

export function bannerNode(
  title: string,
  noticeContent: Node[],
  options: {
    emoji?: keyof EMOJI_MAP;
  } = {}
): Node {
  const pKids: Node[] = [];
  if (options.emoji) {
    pKids.push(text(`${EMOJI_MAP[options.emoji]} `));
  }
  pKids.push(strong(text(title)), text(': '), ...noticeContent);
  return paragraph(pKids);
}
