import { SysHost } from '@code-to-json/utils-ts';
import { ProjectInfo, ProjectPathHelper } from '@snap-doc/utils';

export default class DocEnv {
  public pathHelper: ProjectPathHelper;
  constructor(public projectInfo: ProjectInfo, public host: SysHost) {
    this.pathHelper = new ProjectPathHelper(projectInfo, host);
  }
}
