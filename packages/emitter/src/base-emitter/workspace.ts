import {
  LinkedFormattedOutputData,
  LinkedFormattedSourceFile,
  LinkedFormattedSymbol
} from '@code-to-json/formatter-linker';
import Slugger from '../slugger';
import * as debug from 'debug';
import { UnreachableError } from '@code-to-json/utils';

const log = debug('snap-doc:base-emitter/workspace');

export interface ProjectInfo {
  path: string;
  name: string;
  main?: string;
}

export type Pathable = LinkedFormattedSourceFile | LinkedFormattedSymbol;

abstract class Workspace {
  private internalSlugger?: Slugger;

  private internaData?: LinkedFormattedOutputData;

  private isPrepared = false;

  constructor(protected projectInfo: Readonly<ProjectInfo>) {}

  public async prepare(): Promise<void> {
    if (!this.isPrepared) {
      await this.slugger.prepare();
      this.isPrepared = true;
    } else {
      log('warning: duplicate attempt to prepare workspace was ignored');
    }
  }

  protected get slugger(): Slugger {
    if (!this.internalSlugger) {
      this.internalSlugger = new Slugger(this.data);
    }
    return this.internalSlugger;
  }

  public get data(): Readonly<LinkedFormattedOutputData> {
    if (!this.internaData) {
      throw new Error('data has not been set yet');
    }
    return this.internaData;
  }

  public set data(d: Readonly<LinkedFormattedOutputData>) {
    if (this.internaData) {
      throw new Error('data has already been set');
    }
    this.internaData = d;
  }

  public get projectName(): string {
    return this.projectInfo.name;
  }

  public abstract pathFor(entity: Pathable, options?: any): string;

  protected prefixForSymbol(sym: LinkedFormattedSymbol): string {
    const { flags } = sym;
    if (!flags) {
      return 'symbol';
    }
    if (flags.includes('class')) {
      return 'class';
    }
    return 'type';
  }

  protected prefixFor(entity: Pathable): string {
    if (entity.kind === 'sourceFile') {
      return 'modules';
    } else if (entity.kind === 'symbol') {
      return this.prefixForSymbol(entity);
    } else {
      throw new UnreachableError(entity);
    }
  }
}

export default Workspace;
