import {
  LinkedFormattedOutputData,
  LinkedFormattedSourceFile
} from '@code-to-json/formatter-linker';
import { isDefined } from '@code-to-json/utils';
import { SysHost } from '@code-to-json/utils-ts';
import { FileEmitter, FileEmitterOptions } from '@snap-doc/emitter';
import * as debug from 'debug';
import { markdownForDocFile } from './md/utils';

const log = debug('snap-doc:markdown-file-emitter');

// tslint:disable-next-line:no-empty-interface
export interface MarkdownFileEmitterOptions extends FileEmitterOptions {}

export default class MarkdownFileEmitter extends FileEmitter<MarkdownFileEmitterOptions> {
  constructor(host: SysHost, options: MarkdownFileEmitterOptions) {
    super(host, options);
  }

  public async generate(data: LinkedFormattedOutputData): Promise<void> {
    const { sourceFiles: files } = data;
    const { outDir } = this.options;

    // Ensure that the
    if (this.host.fileOrFolderExists(outDir)) {
      if (!this.host.isFolder(outDir)) {
        throw new Error(`Path ${outDir} exists, but is not a directory`);
      } else if (this.options.overwriteOutDir) {
        log(`Deleting existing contents at ${outDir}`);
        await this.host.removeFolderAndContents(outDir);
      } else {
        throw new Error(
          `Existing content found at ${outDir}. 
Please use either
  (1) the 'overwriteOutDir' API option or 
  (2) the '--force' CLI flag 
if you want to replace existing content in the output directory`
        );
      }
    }

    log(`Creating new directory at ${outDir}`);
    this.host.createFolder(outDir);

    Object.keys(files)
      .map(fname => files[fname])
      .filter(isDefined)
      .filter(f => !f.isDeclarationFile)
      .forEach(f => {
        const outPath = this.host.combinePaths(this.options.outDir, f.path);
        log(`Processing module: ${f.moduleName} (${f.path})`);
        const parentDir = this.host.combinePaths(outPath, '..');
        if (!this.host.fileOrFolderExists(parentDir)) {
          this.host.createFolder(parentDir);
        }
        if (!this.host.isFolder(parentDir)) {
          throw new Error(`${parentDir} is not a directory`);
        }
        const content = this.contentForModule(data, f);
        this.host.writeFileSync(`${outPath}.md`, content);
      });
  }

  public contentForModule(
    data: LinkedFormattedOutputData,
    file: LinkedFormattedSourceFile
  ): string {
    return markdownForDocFile(data, file, {
      omitToc: !!this.options.omitToc
    });
  }
}
