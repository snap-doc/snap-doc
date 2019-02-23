import EmitterOptions from '../base-emitter/options';

export default interface FileEmitterOptions extends EmitterOptions {
  outDir: string;
  overwriteOutDir?: boolean;
}
