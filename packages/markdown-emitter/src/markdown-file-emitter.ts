import { CommentData, CommentParagraphContent } from '@code-to-json/comments/lib/src/types';
import { FileEmitter } from '@snap-doc/emitter';
import { FileEmitterOptions } from '@snap-doc/emitter/lib/src/file-emitter';
import { DocData, DocDataFile } from '@snap-doc/types';
import * as debug from 'debug';
import * as remarkParse from 'remark-parse';
import { RemarkParseOptions } from 'remark-parse/types';
import * as remarkStringify from 'remark-stringify';
import { RemarkStringifyOptions } from 'remark-stringify/types';
import * as unified from 'unified';
import { Node, Parent } from 'unist';

const log = debug('snap-doc:markdown-file-emitter');

const SOURCEFILE_HEADER_TOP_TAGS: string[] = ['author', 'file'];

const MD = unified()
  .use(remarkParse, {
    gfm: true
  } as Partial<RemarkParseOptions>)
  .use(remarkStringify, {
    gfm: true,
    bullet: '*',
    fences: true,
    incrementListMarker: false
  } as Partial<RemarkStringifyOptions>);

function parseParagraphContent(summary: CommentParagraphContent): Node[] {
  const parts: Node[] = [];
  summary.forEach(item => {
    if (typeof item === 'string') {
      parts.push(...(MD.parse(item) as Parent).children);
    } else if (item.kind === 'fencedCode') {
      parts.push({ type: 'code', lang: item.language, value: item.code.trim() });
    } else {
      console.log(item);
    }
  });
  return parts;
}

function createSourceFileRoot(f: DocDataFile): Parent {
  const { name, pathInPackage } = f;
  return {
    type: 'root',
    children: [
      {
        type: 'heading',
        depth: 1,
        children: [
          {
            type: 'text',
            value: name
          }
        ]
      },
      {
        type: 'inlineCode',
        value: pathInPackage
      }
    ]
  };
}

function parseDocumentation(root: Parent, documentation?: CommentData): void {
  if (!documentation) {
    return;
  }
  const { summary, customTags } = documentation;
  const headerTopTags: Array<[string, Node[]]> = [];
  const headerBottomTags: Array<[string, Node[]]> = [];
  if (customTags) {
    customTags.forEach(tag => {
      const { tagName, content } = tag;
      const a = SOURCEFILE_HEADER_TOP_TAGS.includes(tagName) ? headerTopTags : headerBottomTags;
      a.push([tagName, content ? parseParagraphContent(content) : []]);
    });
  }
  root.children.push(...parseParagraphContent(summary));
}

// tslint:disable-next-line:no-empty-interface
export interface MarkdownFileEmitterOptions extends FileEmitterOptions {}

export default class MarkdownFileEmitter<O extends MarkdownFileEmitterOptions> extends FileEmitter<
  O
> {
  constructor(options: O) {
    super(options);
    log('outDir', this.options.outDir);
  }

  public async generate(data: DocData): Promise<void> {
    const { files } = data;
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
    files.forEach(f => {
      const outPath = h.combinePaths(this.options.outDir, f.pathInPackage);
      log(`Processing module: ${f.name} (${f.pathInPackage})`);
      const parentDir = h.combinePaths(outPath, '..');
      if (!h.fileOrFolderExists(parentDir)) {
        h.createFolder(parentDir);
      }
      if (!h.isFolder(parentDir)) {
        throw new Error(`${parentDir} is not a directory`);
      }
      h.writeFileSync(`${outPath}.md`, this.contentForModule(f));
    });
  }

  public contentForModule(file: DocDataFile): string {
    const { documentation } = file;
    const root = createSourceFileRoot(file);
    parseDocumentation(root, documentation);
    return MD.stringify(root);
  }
}
