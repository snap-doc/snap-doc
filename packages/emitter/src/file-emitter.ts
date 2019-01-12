import { SysHost } from '@code-to-json/utils-ts';
import Emitter, { EmitterOptions } from './emitter';

export interface FileEmitterOptions extends EmitterOptions {
  outDir: string;
  host: SysHost;
}

export default class FileEmitter<O extends FileEmitterOptions> extends Emitter<O> {
  constructor(options: O) {
    super(options);
  }
}
