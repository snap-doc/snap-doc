import { SysHost } from '@code-to-json/utils-ts';
import * as debug from 'debug';
import Emitter, { EmitterOptions } from './emitter';

const log = debug('snap-doc:markdown-file-emitter');

export interface FileEmitterOptions extends EmitterOptions {
  outDir: string;
  overwriteOutDir?: boolean;
}

export default class FileEmitter<O extends FileEmitterOptions> extends Emitter<O> {
  constructor(protected host: SysHost, options: O) {
    super(options);
    log('outDir', this.options.outDir);
  }
}
