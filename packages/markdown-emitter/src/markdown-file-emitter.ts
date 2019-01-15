import { FormattedSourceFile } from '@code-to-json/formatter';
import { FormatterOutputData } from '@code-to-json/formatter/lib/src/formatter';
import { FileEmitter, FileEmitterOptions } from '@snap-doc/emitter';
import * as debug from 'debug';
import { markdownForDocFile } from './md/utils';

const log = debug('snap-doc:markdown-file-emitter');

// tslint:disable-next-line:no-empty-interface
export interface MarkdownFileEmitterOptions extends FileEmitterOptions {}

export default class MarkdownFileEmitter extends FileEmitter<MarkdownFileEmitterOptions> {
  constructor(options: MarkdownFileEmitterOptions) {
    super(options);
    log('outDir', this.options.outDir);
  }

  public async generate(data: FormatterOutputData): Promise<void> {
    const { sourceFiles: files } = data;
    const { outDir, host: h } = this.options;
    const outExists = h.fileOrFolderExists(outDir);
    if (outExists && !h.isFolder(outDir)) {
      throw new Error(`Path ${outDir} exists, but is not a directory`);
    } else if (outExists) {
      log(`Deleting existing contents at ${outDir}`);
      await h.removeFolderAndContents(outDir);
    }
    log(`Creating new directory at ${outDir}`);
    h.createFolder(outDir);
    Object.keys(files)
      .map(fname => files[fname])
      .filter(f => !f.isDeclarationFile)
      .forEach(f => {
        const outPath = h.combinePaths(this.options.outDir, f.pathInPackage);
        log(`Processing module: ${f.name} (${f.pathInPackage})`);
        const parentDir = h.combinePaths(outPath, '..');
        if (!h.fileOrFolderExists(parentDir)) {
          h.createFolder(parentDir);
        }
        if (!h.isFolder(parentDir)) {
          throw new Error(`${parentDir} is not a directory`);
        }
        h.writeFileSync(`${outPath}.md`, this.contentForModule(data, f));
      });
  }

  public contentForModule(data: FormatterOutputData, file: FormattedSourceFile): string {
    return markdownForDocFile(data, file, {
      omitToc: !!this.options.omitToc
    });
  }
}
