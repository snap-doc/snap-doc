import { walkProgram } from '@code-to-json/core';
import { WalkerOptions } from '@code-to-json/core/lib/src/walker/options';
import { FormatterOptions, FormatterOutput, formatWalkerOutput } from '@code-to-json/formatter';
import { NodeHost } from '@code-to-json/utils-node';
import { Emitter } from '@snap-doc/emitter';
import { Logger, TempFolderCreator } from '@snap-doc/types';
import * as ts from 'typescript';

export interface DocGeneratorOptions {
  emitter: Emitter<any>;
}

function generateWalkerOptions(): Partial<WalkerOptions> {
  return {};
}
function generateFormatterOptions(): Partial<FormatterOptions> {
  return {};
}

function analyzeProgram(program: ts.Program): FormatterOutput {
  const walkerOutput = walkProgram(program, new NodeHost(), generateWalkerOptions());
  const formatted = formatWalkerOutput(walkerOutput, generateFormatterOptions());
  return formatted;
}

export interface DocGeneratorUtilities {
  tmp: TempFolderCreator;
  logger: Logger;
}

export default class DocGenerator {
  constructor(
    protected prog: ts.Program,
    protected utils: DocGeneratorUtilities,
    protected options: DocGeneratorOptions
  ) {}

  public async emit(): Promise<void> {
    analyzeProgram(this.prog);
    const workspace = this.utils.tmp();
    this.utils.logger(workspace.name);
  }
}
