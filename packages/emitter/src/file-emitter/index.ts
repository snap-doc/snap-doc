import { SysHost } from '@code-to-json/utils-ts';
import * as debug from 'debug';
import Emitter from '../base-emitter';
import FileEmitterOptions from './options';
import FileEmitterWorkspace from './workspace';

const log = debug('snap-doc:markdown-file-emitter');

abstract class FileEmitter<
  O extends FileEmitterOptions,
  W extends FileEmitterWorkspace
> extends Emitter<O, W> {
  constructor(protected host: SysHost, options: O) {
    super(options);
    log('outDir', this.options.outDir);
  }

  public pathInOutDir(...pathParts: string[]): string {
    const outPath = this.host.combinePaths(...pathParts);
    const outPathAbsolute = this.host.combinePaths(this.options.outDir, outPath);
    // ensure the parent folder exists
    const parentDir = this.host.combinePaths(outPathAbsolute, '..');
    if (!this.host.fileOrFolderExists(parentDir)) {
      this.host.createFolder(parentDir);
    }
    if (!this.host.isFolder(parentDir)) {
      throw new Error(`${parentDir} is not a directory`);
    }
    return outPath;
  }

  public writeFileInOutDir(path: string, content: string): void {
    return this.host.writeFileSync(this.host.combinePaths(this.options.outDir, path), content);
  }
}
export default FileEmitter;
