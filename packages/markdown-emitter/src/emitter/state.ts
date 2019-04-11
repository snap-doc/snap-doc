import { EmitterState } from '@snap-doc/emitter';
import { LinkedFormattedOutputData } from '@code-to-json/formatter-linker';

export default class MarkdownEmitterState extends EmitterState {
  constructor(public readonly ext: string, data: LinkedFormattedOutputData) {
    super(data);
    if (['md', 'html'].indexOf(ext) < 0) throw new Error(`Invalid extension: "${ext}"`);
  }
}
