import { LinkedFormattedOutputData } from '@code-to-json/formatter-linker';
import * as debug from 'debug';
import Slugger, { Sluggable } from '../slugger';

const log = debug('snap-doc:base-emitter/state');

class State {
  public readonly slugger: Slugger;

  private isPrepared = false;

  constructor(public readonly data: LinkedFormattedOutputData) {
    this.slugger = new Slugger(data);
  }

  public async prepare(): Promise<void> {
    if (!this.isPrepared) {
      log('preparing state');
      await this.slugger.prepare();
      this.isPrepared = true;
    } else {
      log('warning: duplicate attempt to prepare state was ignored');
    }
  }

  public slugFor(entity: Sluggable): string {
    return this.slugger.slugFor(entity);
  }
}

export default State;
