import Workspace from '../base-emitter/workspace';
import Emitter from '../base-emitter';
import MultiEmitterOptions from './options';
import State from '../base-emitter/state';

class MultiEmitter extends Emitter<MultiEmitterOptions, Workspace> {
  constructor(protected emitters: Emitter<any, any>[], options: MultiEmitterOptions) {
    super(options);
  }

  protected get isParallel(): boolean {
    return !!(this.options || {}).parallel;
  }

  public async generate(state: State, workspace: Workspace): Promise<void> {
    if (this.isParallel) {
      // parallel
      await Promise.all(this.emitters.map(e => e.generate(state, workspace)));
    } else {
      for (const e of this.emitters) {
        // eslint-disable-next-line no-await-in-loop
        await e.generate(state, workspace); // deliberately serial
      }
    }
  }
}

export default MultiEmitter;
