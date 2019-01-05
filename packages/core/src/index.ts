import * as ts from 'typescript';
interface DocGenOptions {
  outpath: string;
}

export async function generateDocumentationForProgram(
  program: ts.Program,
  options: DocGenOptions
): Promise<any> {
  return 'bar';
}
