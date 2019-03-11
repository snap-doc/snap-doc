import { LinkedFormattedSourceFile, LinkedFormattedSymbol } from '@code-to-json/formatter-linker';
import { UnreachableError } from '@code-to-json/utils';
import * as debug from 'debug';
import State from './state';

const log = debug('snap-doc:base-emitter/workspace');

export interface ProjectInfo {
  path: string;
  name: string;
  main?: string;
}

export type Pathable = LinkedFormattedSourceFile | LinkedFormattedSymbol;

abstract class Workspace {
  constructor(protected projectInfo: Readonly<ProjectInfo>) {
    log('initializing workspace');
  }

  public async prepare(): Promise<void> {}

  public get projectName(): string {
    return this.projectInfo.name;
  }

  public abstract pathFor(state: State, entity: Pathable, options?: any): string;

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
    }
    if (entity.kind === 'symbol') {
      return this.prefixForSymbol(entity);
    }
    throw new UnreachableError(entity);
  }
}

export default Workspace;
