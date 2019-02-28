import { FileEmitterWorkspace, Pathable } from '@snap-doc/emitter';

export default class MarkdownFileEmitterWorkspace extends FileEmitterWorkspace {
  public pathFor(entity: Pathable): string {
    return super.pathFor(entity, 'md');
  }

  public relativePath(from: Pathable, to: Pathable): string {
    return super.relativePath(from, to, 'md');
  }
}
