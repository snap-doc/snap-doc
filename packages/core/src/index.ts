import { walkProgram } from '@code-to-json/core';
import { WalkerOptions } from '@code-to-json/core/lib/src/walker/options';
import { FormatterOptions, FormatterOutput, formatWalkerOutput } from '@code-to-json/formatter';
import * as ts from 'typescript';
interface DocGenOptions {
  outpath: string;
}

function generateWalkerOptions(): Partial<WalkerOptions> {
  return {};
}
function generateFormatterOptions(): Partial<FormatterOptions> {
  return {};
}

function analyzeProgram(program: ts.Program): FormatterOutput {
  const walkerOutput = walkProgram(program, generateWalkerOptions());
  const formatted = formatWalkerOutput(walkerOutput, generateFormatterOptions());
  return formatted;
}

export async function generateDocumentationForProgram(
  program: ts.Program,
  options: DocGenOptions
): Promise<any> {
  const code = analyzeProgram(program);
  const { sourceFiles } = code;
  for (const f of sourceFiles) {
    // tslint:disable-next-line:no-console
    console.log(f.name);
    const { exports = [] } = f;
    for (const e of exports) {
      // tslint:disable-next-line:no-console
      console.log('  ' + e.name);
    }
  }
}
