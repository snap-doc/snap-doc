import { Attacher, Compiler } from 'unified';
import { Node } from 'unist';

interface RemarkHTML extends Attacher {
  Compiler: Compiler;
}
declare const remarkHTML: RemarkHTML;
export = remarkHTML;
