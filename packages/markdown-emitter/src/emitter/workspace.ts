import { FileEmitterWorkspace } from '@snap-doc/emitter';
import { Pathable } from '@snap-doc/emitter/lib/src/base-emitter/workspace';

export default class MarkdownFileEmitterWorkspace extends FileEmitterWorkspace {
  public pathFor(entity: Pathable): string {
    return super.pathFor(entity, 'md');
  }
}
