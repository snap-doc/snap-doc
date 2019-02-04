import { walkProgram } from '@code-to-json/core';
import { WalkerOptions } from '@code-to-json/core/lib/src/walker/options';
import { FormatterOptions, formatWalkerOutput } from '@code-to-json/formatter';
import { LinkedFormattedOutputData, linkFormatterData } from '@code-to-json/formatter-linker';
import { createReverseResolver, ProjectInfo, SysHost } from '@code-to-json/utils-ts';
import { Emitter } from '@snap-doc/emitter';
import { TempFolderCreator } from '@snap-doc/types';
import * as debug from 'debug';
import * as ts from 'typescript';

const log = debug('snap-doc:doc-generator');

export interface DocGeneratorOptions {
  emitter: Emitter<any>;
  pkgInfo: ProjectInfo;
}

function generateWalkerOptions(host: SysHost, pkgInfo: ProjectInfo): Partial<WalkerOptions> {
  return {
    pathNormalizer: createReverseResolver(host, pkgInfo)
  };
}
function generateFormatterOptions(): Partial<FormatterOptions> {
  return {};
}

function analyzeProgram(
  program: ts.Program,
  host: SysHost,
  pkgInfo: ProjectInfo
): LinkedFormattedOutputData {
  const walkerOptions = generateWalkerOptions(host, pkgInfo);
  log('walker options: ', walkerOptions);
  const walkerOutput = walkProgram(program, host, walkerOptions);
  const formatterOptions = generateFormatterOptions();
  log('formatter options: ', formatterOptions);
  const formatted = formatWalkerOutput(walkerOutput, formatterOptions);
  const linked = linkFormatterData(formatted.data);
  return linked;
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
    const data = analyzeProgram(this.prog, this.host, this.options.pkgInfo);
    await this.options.emitter.emit(data);
  }
}
