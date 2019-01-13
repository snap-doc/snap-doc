// TODO flesh out types
declare module 'mdast-util-toc' {
  import { Node, Parent } from 'unist';
  const toc: (
    node: Node
  ) => {
    map: Parent;
  };
  export = toc;
}
