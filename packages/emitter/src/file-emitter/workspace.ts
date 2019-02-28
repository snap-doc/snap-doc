import { LinkedFormattedSourceFile, LinkedFormattedSymbol } from '@code-to-json/formatter-linker';
import { UnreachableError } from '@code-to-json/utils';
import { SysHost } from '@code-to-json/utils-ts';
import Workspace, { Pathable, ProjectInfo } from '../base-emitter/workspace';

export default class FileEmitterWorkspace extends Workspace {
  constructor(public readonly host: SysHost, projectInfo: ProjectInfo) {
    super(projectInfo);
  }

  public pathFor(entity: Pathable, extension: string): string {
    return `${this.host.combinePaths(...this.pathPartsFor(entity))}.${extension}`;
  }

  protected pathPartsForSourceFile(entity: LinkedFormattedSourceFile): string[] {
    const slug = this.slugger.slugFor(entity);
    const modulePath = this.projectInfo.main
      ? this.host.pathRelativeTo(this.host.combinePaths(this.projectInfo.main, '..'), slug)
      : slug;
    return [this.prefixFor(entity), modulePath];
  }

  protected pathPartsForSymbol(entity: LinkedFormattedSymbol): string[] {
    return [this.prefixFor(entity), this.slugger.slugFor(entity)];
  }

  protected pathPartsFor(entity: Pathable): string[] {
    if (entity.kind === 'sourceFile') {
      return this.pathPartsForSourceFile(entity);
    }
    if (entity.kind === 'symbol') {
      return this.pathPartsForSymbol(entity);
    }
    throw new UnreachableError(entity);
  }

  public relativePath(from: Pathable, to: Pathable, extension: string): string {
    return this.host.pathRelativeTo(
      this.host.combinePaths(this.pathFor(from, extension), '..'),
      this.pathFor(to, extension),
    );
  }
}
