import * as debug from 'debug';
import EmitterOptions from './options';
import Workspace from './workspace';

const log = debug('snap-doc:base-emitter');

abstract class Emitter<O extends EmitterOptions = EmitterOptions, W extends Workspace = Workspace> {
  constructor(protected options: O) {}

  public async emit(workspace: W): Promise<void> {
    const [ready, err] = await this.validateConditions();
    if (ready) {
      await this.prepare(workspace);
    } else {
      throw new Error(`[${this.constructor.name}] - Pre-flight check failed: ${err}`);
    }
    await this.generate(workspace);
    await this.validateResult();
  }

  protected async validateConditions(): Promise<[true] | [false, string]> {
    return [true];
  }

  protected async prepare(workspace: W): Promise<void> {
    log('preparing emitter');
    await workspace.prepare();
  }

  protected abstract async generate(workspace: W): Promise<void>;

  protected async validateResult(): Promise<void> {
    return Promise.resolve();
  }
}

export default Emitter;
