import { FileEmitter } from '@snap-doc/emitter';
import { FileEmitterOptions } from '@snap-doc/emitter/lib/src/file-emitter';
import * as debug from 'debug';

const log = debug('snap-doc:markdown-file-emitter');

export interface MarkdownFileEmitterOptions extends FileEmitterOptions {
  foo?: string;
}

export default class MarkdownFileEmitter<O extends MarkdownFileEmitterOptions> extends FileEmitter<
  O
> {
  constructor(options: O) {
    super(options);
    log('outDir', this.options.outDir);
  }
}
