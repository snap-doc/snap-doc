import { UnreachableError } from '@code-to-json/utils';
import { SysHost } from '@code-to-json/utils-ts';
import Workspace, { Pathable, ProjectInfo } from '../base-emitter/workspace';
import { LinkedFormattedSourceFile, LinkedFormattedSymbol } from '@code-to-json/formatter-linker';

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
    } else if (entity.kind === 'symbol') {
      return this.pathPartsForSymbol(entity);
    } else {
      throw new UnreachableError(entity);
    }
  }
}
