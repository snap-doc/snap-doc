import * as toc from 'mdast-util-toc';
import { Node, Parent } from 'unist';

function indexOfFirstHeading(nodes: Node[], depth: number): number {
  for (let idx = 0; idx < nodes.length; idx++) {
    const ch = nodes[idx];
    if (ch.type === 'heading' && (ch as any).depth === depth) {
      return idx;
    }
  }
  return -1;
}

export function addToc(root: Parent): void {
  const tocNode = toc(root, { tight: true, maxDepth: 4 }).map;
  const importantParents = tocNode.children[0].children as Parent[];
  if (importantParents.length <= 1) {
    return;
  }
  tocNode.children = importantParents[1].children;
  const idx1 = indexOfFirstHeading(root.children, 1);

  root.children.splice(idx1 + 1, 0, tocNode);
}
