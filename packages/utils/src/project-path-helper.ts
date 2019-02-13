import { UnreachableError } from '@code-to-json/utils';
import { SysHost } from '@code-to-json/utils-ts';

export interface ProjectInfo {
  path: string;
  name: string;
  main?: string;
}

export type SluggedEntities = 'class' | 'type' | 'module';

export default class ProjectPathHelper {
  constructor(
    public projectInfo: ProjectInfo,
    public partialHost: Pick<SysHost, 'combinePaths' | 'pathRelativeTo'>
  ) {}

  public pathForSlug(entity: SluggedEntities, slug: string): string {
    switch (entity) {
      case 'module': {
        if (!this.projectInfo.main) {
          return slug;
        } else {
          return this.partialHost.pathRelativeTo(
            this.partialHost.combinePaths(this.projectInfo.main, '..'),
            slug
          );
        }
      }
      case 'type':
      case 'class':
        return this.partialHost.combinePaths(entity, slug);
      default:
        throw new UnreachableError(entity);
    }
  }
}
