import * as debug from 'debug';
import { EmitterData } from '../types';
import EmitterOptions from './options';
import State from './state';
import Workspace from './workspace';

const log = debug('snap-doc:base-emitter');

export interface EmitterLike {
  emit(workspace: Workspace, data: EmitterData): Promise<void>;
  generate(state: State, workspace: Workspace): Promise<void>;
}

abstract class Emitter<O extends EmitterOptions, W extends Workspace> implements EmitterLike {
  constructor(protected options: O) {}

  public async emit(workspace: W, data: EmitterData): Promise<void> {
    const [ready, err] = await this.validateConditions();
    let state: State;
    if (ready) {
      state = await this.initializeState(data);
      await this.prepare(state, workspace);
    } else {
      throw new Error(`[${this.constructor.name}] - Pre-flight check failed: ${err}`);
    }
    await this.generate(state, workspace);
    await this.validateResult();
  }

  protected async validateConditions(): Promise<[true] | [false, string]> {
    return [true];
  }

  protected async prepare(state: State, workspace: W): Promise<void> {
    log('preparing emitter');
    await Promise.all([state.prepare(), workspace.prepare()]);
  }

  protected async initializeState(data: EmitterData): Promise<State> {
    return new State(data);
  }

  public abstract async generate(state: State, workspace: W): Promise<void>;

  protected async validateResult(): Promise<void> {
    return Promise.resolve();
  }
}

export default Emitter;
