import { FileEmitterOptions } from '@snap-doc/emitter';

export default interface MarkdownFileEmitterOptions extends FileEmitterOptions {
  detailedModules?: boolean;
  html?: boolean;
}
