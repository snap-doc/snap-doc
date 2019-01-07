import Emitter, { EmitterOptions } from './emitter';

export interface FileEmitterOptions extends EmitterOptions {
  outDir: string;
}

export default class FileEmitter<O extends FileEmitterOptions> extends Emitter<O> {
  constructor(options: O) {
    super(options);
  }
}
