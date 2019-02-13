import {
  LinkedFormattedOutputData,
  LinkedFormattedSourceFile,
  LinkedFormattedSymbol
} from '@code-to-json/formatter-linker';
import { isDefined } from '@code-to-json/utils';
import { SysHost } from '@code-to-json/utils-ts';
import { FileEmitter, FileEmitterOptions } from '@snap-doc/emitter';
import { DocDataSource, DocEnvLike } from '@snap-doc/types';
import * as debug from 'debug';
import { markdownForSourceFile } from './md/utils/source-file';
import { markdownForSymbolFile } from './md/utils/symbol';

const log = debug('snap-doc:markdown-file-emitter');

// tslint:disable-next-line:no-empty-interface
export interface MarkdownFileEmitterOptions extends FileEmitterOptions {}

export default class MarkdownFileEmitter extends FileEmitter<MarkdownFileEmitterOptions> {
  constructor(host: SysHost, options: MarkdownFileEmitterOptions) {
    super(host, options);
  }

  // tslint:disable-next-line:cognitive-complexity
  public async generate(source: DocDataSource, env: DocEnvLike): Promise<void> {
    const {
      data,
      data: { sourceFiles: files }
    } = source;
    const { outDir } = this.options;

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

    const classSymbols: LinkedFormattedSymbol[] = [];
    const typeSymbols: LinkedFormattedSymbol[] = [];

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
        const content = this.contentForModule(data, f, env, {
          classes: classSymbols,
          types: typeSymbols
        });
        this.host.writeFileSync(
          this.host.combinePaths(
            this.options.outDir,
            `${env.pathHelper.pathForSlug('module', f.path)}.md`
          ),
          content
        );
      });
    classSymbols.forEach(classSymbol => {
      const outPath = this.host.combinePaths(
        this.options.outDir,
        'classes',
        source.slugFor(classSymbol)
      );
      const parentDir = this.host.combinePaths(outPath, '..');
      if (!this.host.fileOrFolderExists(parentDir)) {
        this.host.createFolder(parentDir);
      }
      if (!this.host.isFolder(parentDir)) {
        throw new Error(`${parentDir} is not a directory`);
      }
      const content = this.contentForSymbol(data, classSymbol);
      const pathForMarkdown = env.pathHelper.pathForSlug('class', source.slugFor(classSymbol));
      this.host.writeFileSync(this.host.combinePaths(outDir, `${pathForMarkdown}.md`), content);
    });
    typeSymbols.forEach(typeSymbol => {
      const outPath = this.host.combinePaths(
        this.options.outDir,
        'interfaces',
        source.slugFor(typeSymbol)
      );
      const parentDir = this.host.combinePaths(outPath, '..');
      if (!this.host.fileOrFolderExists(parentDir)) {
        this.host.createFolder(parentDir);
      }
      if (!this.host.isFolder(parentDir)) {
        throw new Error(`${parentDir} is not a directory`);
      }
      const content = this.contentForSymbol(data, typeSymbol);
      const pathForMarkdown = env.pathHelper.pathForSlug('class', source.slugFor(typeSymbol));
      this.host.writeFileSync(this.host.combinePaths(outDir, `${pathForMarkdown}.md`), content);
    });
  }

  protected contentForSymbol(data: LinkedFormattedOutputData, sym: LinkedFormattedSymbol): string {
    return markdownForSymbolFile(data, sym);
  }

  protected contentForModule(
    data: LinkedFormattedOutputData,
    file: LinkedFormattedSourceFile,
    env: DocEnvLike,
    symbolsToSerialize: { classes: LinkedFormattedSymbol[]; types: LinkedFormattedSymbol[] }
  ): string {
    log(`serializing module: ${file.moduleName}`);
    const classSymbols: LinkedFormattedSymbol[] = [];
    const typeSymbols: LinkedFormattedSymbol[] = [];

    const sourceFileMarkdown = markdownForSourceFile(
      data,
      file,
      env,
      {
        omitToc: !!this.options.omitToc
      },
      {
        classes: classSymbols,
        types: typeSymbols
      }
    );
    log(`  ├─ found classes:\t${classSymbols.map(s => s.text).join(', ')}`);
    log(`  └─ found types:\t${typeSymbols.map(s => s.text).join(', ')}`);
    symbolsToSerialize.classes.push(...classSymbols);
    symbolsToSerialize.types.push(...typeSymbols);
    return sourceFileMarkdown;
  }
}
