import { LinkedFormattedSourceFile, LinkedFormattedSymbol } from '@code-to-json/formatter-linker';
import { UnreachableError } from '@code-to-json/utils';
import { SysHost } from '@code-to-json/utils-ts';
import State from '../base-emitter/state';
import Workspace, { Pathable, ProjectInfo } from '../base-emitter/workspace';

export interface FileEmitterWorkspaceOptions {}

export default class FileEmitterWorkspace extends Workspace {
  protected options: FileEmitterWorkspaceOptions;

  constructor(
    public readonly host: SysHost,
    projectInfo: ProjectInfo,
    options: FileEmitterWorkspaceOptions = {},
  ) {
    super(projectInfo);
    this.options = options;
  }

  public pathFor(state: State, entity: Pathable, extension: string): string {
    if (extension.length === 0) throw new Error('invalid extension');
    return [this.host.combinePaths(...this.pathPartsFor(state, entity)), extension].join('.');
  }

  protected pathPartsForSourceFile(state: State, entity: LinkedFormattedSourceFile): string[] {
    const slug = state.slugFor(entity);
    const modulePath = this.projectInfo.main
      ? this.host.pathRelativeTo(this.host.combinePaths(this.projectInfo.main, '..'), slug)
      : slug;
    return [this.prefixFor(entity), modulePath];
  }

  protected pathPartsForSymbol(state: State, entity: LinkedFormattedSymbol): string[] {
    return [this.prefixFor(entity), state.slugFor(entity)];
  }

  protected pathPartsFor(state: State, entity: Pathable): string[] {
    if (entity.kind === 'sourceFile') {
      return this.pathPartsForSourceFile(state, entity);
    }
    if (entity.kind === 'symbol') {
      return this.pathPartsForSymbol(state, entity);
    }
    throw new UnreachableError(entity);
  }

  public relativePath(state: State, from: Pathable, to: Pathable, extension: string): string {
    const fromPath = this.pathFor(state, from, extension);
    const toPath = this.pathFor(state, to, extension);
    const res = this.host.pathRelativeTo(this.host.combinePaths(fromPath, '..'), toPath);
    return res;
  }
}
