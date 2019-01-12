import { walkProgram } from '@code-to-json/core';
import { WalkerOptions } from '@code-to-json/core/lib/src/walker/options';
import { FormatterOptions, FormatterOutput, formatWalkerOutput } from '@code-to-json/formatter';
import { generateModulePathNormalizer, ProjectInfo, SysHost } from '@code-to-json/utils-ts';
import { Emitter } from '@snap-doc/emitter';
import { TempFolderCreator } from '@snap-doc/types';
import * as debug from 'debug';
import * as ts from 'typescript';
import { generateDocData } from './doc-data';

const log = debug('snap-doc:doc-generator');

export interface DocGeneratorOptions {
  emitter: Emitter<any>;
  pkgInfo: ProjectInfo;
}

function generateWalkerOptions(host: SysHost, pkgInfo: ProjectInfo): Partial<WalkerOptions> {
  return {
    pathNormalizer: generateModulePathNormalizer(host, pkgInfo)
  };
}
function generateFormatterOptions(): Partial<FormatterOptions> {
  return {};
}

function analyzeProgram(program: ts.Program, host: SysHost, pkgInfo: ProjectInfo): FormatterOutput {
  const walkerOptions = generateWalkerOptions(host, pkgInfo);
  log('walker options: ', walkerOptions);
  const walkerOutput = walkProgram(program, host, walkerOptions);
  const formatterOptions = generateFormatterOptions();
  log('formatter options: ', formatterOptions);
  const formatted = formatWalkerOutput(walkerOutput, formatterOptions);
  return formatted;
}

export interface DocGeneratorUtilities {
  tmp: TempFolderCreator;
}

export default class DocGenerator {
  constructor(
    protected prog: ts.Program,
    protected host: SysHost,
    protected options: DocGeneratorOptions
  ) {}

  public async emit(): Promise<void> {
    const formatterOutput = analyzeProgram(this.prog, this.host, this.options.pkgInfo);
    const docData = generateDocData(formatterOutput);
    await this.options.emitter.emit(docData);
  }
}
