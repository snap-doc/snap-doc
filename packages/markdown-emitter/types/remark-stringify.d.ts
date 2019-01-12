declare module 'remark-stringify/types' {
  export interface RemarkStringifyOptions {
    gfm: boolean;
    commonmark: boolean;
    entities: boolean | 'numbers' | 'escape';
    setext: boolean;
    closeAtx: boolean;
    looseTable: boolean;
    spacedTable: boolean;
    paddedTable: boolean;
    stringLength: (s: string) => number;
    fence: '~' | '`';
    bullet: '-' | '*' | '+';
    listItemIndent: 'tab' | '1' | 'mixed';
    incrementListMarker: boolean;
    rule: '-' | '_' | '*';
    ruleRepetition: number;
    ruleSpaces: boolean;
    strong: '_' | '*';
    emphasis: '_' | '*';
  }
}

declare module 'remark-stringify' {
  import { RemarkStringifyOptions } from 'remark-stringify/types';
  import { Attacher, Compiler } from 'unified';
  import { Node } from 'unist';

  interface Stringify extends Attacher {
    Compiler: Compiler;
    (options: RemarkStringifyOptions): void;
  }
  const stringify: Stringify;
  export = stringify;
}
