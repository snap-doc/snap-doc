// TODO flesh out types
declare module 'mdast-util-toc' {
  import { Node, Parent } from 'unist';

  const toc: (
    node: Node,
    options?: {
      heading?: string;
      tight?: boolean;
      maxDepth?: number;
    },
  ) => {
    map: Parent;
  };
  export = toc;
}
