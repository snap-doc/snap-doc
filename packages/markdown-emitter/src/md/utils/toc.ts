import * as toc from 'mdast-util-toc';
import { Node, Parent } from 'unist';
import { createSection } from './section';

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
  const tocNode = toc(root, { tight: true }).map;
  const importantParents = tocNode.children[0].children as Parent[];
  if (importantParents.length <= 1) {
    return;
  }
  tocNode.children = importantParents[1].children;
  const idx1 = indexOfFirstHeading(root.children, 1);

  const tocSection = createSection(2, 'Table of Contents', [tocNode]);

  root.children.splice(idx1 + 1, 0, ...tocSection);
}
