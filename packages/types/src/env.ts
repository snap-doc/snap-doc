import { SysHost } from '@code-to-json/utils-ts';
import { ProjectPathHelper } from '@snap-doc/utils';

export interface DocEnvLike {
  pathHelper: ProjectPathHelper;
  host: SysHost;
}
