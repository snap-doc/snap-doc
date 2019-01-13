import { FormatterOutput } from '@code-to-json/formatter';
import { DocData, DocDataFile } from '@snap-doc/types';

export function generateDocData(input: FormatterOutput): DocData {
  const {
    data: { sourceFiles }
  } = input;
  const files: DocDataFile[] = Object.keys(sourceFiles).map(fname => {
    const f = sourceFiles[fname];
    const { moduleName, pathInPackage, documentation } = f;
    return {
      name: moduleName,
      pathInPackage,
      documentation
    };
  });
  return { files };
}
