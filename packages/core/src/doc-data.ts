import { FormatterOutput } from '@code-to-json/formatter';
import { DocData, DocDataFile } from '@snap-doc/types';

export function generateDocData(input: FormatterOutput): DocData {
  const files: DocDataFile[] = input.sourceFiles.map(f => {
    const { moduleName, pathInPackage, documentation } = f;
    return {
      name: moduleName,
      pathInPackage,
      documentation
    };
  });
  return { files };
}
