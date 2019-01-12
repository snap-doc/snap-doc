import { Node, Parent } from 'unist';

/**
 * Test whether a Node is a Parent
 * @param n node to tes
 * @private
 */
export function isParent(n: Node): n is Parent {
  return (n as any).children && (n as any).children instanceof Array;
}

/**
 * Remove position information from nodes
 * @param nodes nodes to remove position information from
 * @private
 */
export function removePositionInformation(nodes: Node[]): Node[] {
  return nodes.map(n => {
    if (isParent(n)) {
      removePositionInformation(n.children);
    }
    delete n.position;
    return n;
  });
}
