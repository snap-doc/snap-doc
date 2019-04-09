import {
  LinkedFormattedOutputData,
  LinkedFormattedSourceFile,
  LinkedFormattedSymbol,
} from '@code-to-json/formatter-linker';
import { isDefined } from '@code-to-json/utils';
import { SysHost } from '@code-to-json/utils-ts';
import { FileEmitter, FileEmitterWorkspace } from '@snap-doc/emitter';
import * as debug from 'debug';
import { heading, link, list, listItem, paragraph, rootWithTitle, text } from 'mdast-builder';
import * as remarkHtml from 'remark-html';
import * as remarkParse from 'remark-parse';
import * as remarkStringify from 'remark-stringify';
import * as unified from 'unified';
import { markdownForSourceFile } from '../md/file-generators/module';
import { markdownForSymbolFile } from '../md/file-generators/symbol';
import parserOptions from '../md/parser-options';
import stringifyOptions from '../md/stringify-options';
import MarkdownFileEmitterOptions from './options';
import MarkdownEmitterState from './state';

const log = debug('snap-doc:markdown-file-emitter');

export default class MarkdownFileEmitter extends FileEmitter<
  MarkdownFileEmitterOptions,
  FileEmitterWorkspace
> {
  protected md: unified.Processor = unified();

  protected readonly ext: string = 'md';

  constructor(host: SysHost, options: MarkdownFileEmitterOptions) {
    super(host, options);
    this.md.use(remarkParse, parserOptions);
    if (options.html) {
      this.md.use(remarkHtml);
      this.ext = 'html';
    } else {
      this.md.use(remarkStringify, stringifyOptions);
    }
  }

  protected async initializeState(data: LinkedFormattedOutputData): Promise<MarkdownEmitterState> {
    return new MarkdownEmitterState(this.ext, data);
  }

  public async generate(
    state: MarkdownEmitterState,
    workspace: FileEmitterWorkspace,
  ): Promise<void> {
    const {
      data: { sourceFiles: files },
    } = state;
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
if you want to replace existing content in the output directory`,
        );
      }
    }

    log(`Creating new directory at ${outDir}`);
    this.host.createFolder(outDir);

    const classSymbols: LinkedFormattedSymbol[] = [];
    const typeSymbols: LinkedFormattedSymbol[] = [];

    const modulePaths = Object.keys(files)
      .map(fname => files[fname])
      .filter(isDefined)
      .filter(f => !f.isDeclarationFile)
      .map(f => {
        // for each non-declaration file
        log(`Processing module: ${f.moduleName} (${f.path})`);
        const outPath = this.pathInOutDir(workspace.pathFor(state, f, this.ext));
        const content = this.contentForModule(state, workspace, f, {
          classes: classSymbols,
          types: typeSymbols,
        });
        this.writeFileInOutDir(outPath, content);
        return [f.moduleName, outPath];
      });
    // for each class collected along the way
    const classPaths = classSymbols.map(classSymbol => {
      // determine the output path
      const outPath = this.pathInOutDir(workspace.pathFor(state, classSymbol, this.ext));

      const content = this.contentForSymbol(state, workspace, classSymbol);
      // ...and write it
      this.writeFileInOutDir(outPath, content);
      return [classSymbol.text || classSymbol.name, outPath];
    });
    // for each type collected along the way
    const typePaths = typeSymbols.map(typeSymbol => {
      const outPath = this.pathInOutDir(workspace.pathFor(state, typeSymbol, this.ext));
      const content = this.contentForSymbol(state, workspace, typeSymbol);
      this.writeFileInOutDir(outPath, content);
      return [typeSymbol.text || typeSymbol.name, outPath];
    });

    const tree = rootWithTitle(1, text(workspace.projectName), [
      heading(2, text('Modules')),
      paragraph(
        list('unordered', modulePaths.map(mp => listItem(link(mp[1], mp[0], text(mp[0]))))),
      ),
      heading(2, text('Classes')),
      paragraph(list('unordered', classPaths.map(cp => listItem(link(cp[1], cp[0], text(cp[0])))))),
      heading(2, text('Types')),
      paragraph(list('unordered', typePaths.map(tp => listItem(link(tp[1], tp[0], text(tp[0])))))),
    ]);

    this.writeFileInOutDir(
      this.ext === 'html' ? 'index.html' : 'README.md',
      this.md.stringify(tree).trim(),
    );
  }

  protected contentForSymbol(
    state: MarkdownEmitterState,
    workspace: FileEmitterWorkspace,
    sym: LinkedFormattedSymbol,
  ): string {
    const root = markdownForSymbolFile(state, workspace, sym);
    return this.md.stringify(root).trim();
  }

  protected contentForModule(
    state: MarkdownEmitterState,
    workspace: FileEmitterWorkspace,
    file: LinkedFormattedSourceFile,
    symbolsToSerialize: { classes: LinkedFormattedSymbol[]; types: LinkedFormattedSymbol[] },
  ): string {
    log(`serializing module: ${file.moduleName}`);
    const classSymbols: LinkedFormattedSymbol[] = [];
    const typeSymbols: LinkedFormattedSymbol[] = [];

    const sourceFileMarkdown = markdownForSourceFile(
      state,
      workspace,
      file,
      {
        omitToc: !!this.options.omitToc,
        detailedModules: this.options.detailedModules || false,
      },
      {
        classes: classSymbols,
        types: typeSymbols,
      },
    );
    log(`  ├─ found classes:\t${classSymbols.map(s => s.text).join(', ')}`);
    log(`  └─ found types:\t${typeSymbols.map(s => s.text).join(', ')}`);
    symbolsToSerialize.classes.push(...classSymbols);
    symbolsToSerialize.types.push(...typeSymbols);
    return this.md.stringify(sourceFileMarkdown).trim();
  }
}
