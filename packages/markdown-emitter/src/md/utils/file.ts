import { LinkedFormattedSourceFile, LinkedFormattedSymbol } from '@code-to-json/formatter-linker';
import { Parent } from 'unist';

/**
 * Create a source root node and initial children for a file
 * @param f file
 * @private
 */
export function createSourceFileRoot(f: LinkedFormattedSourceFile | LinkedFormattedSymbol): Parent {
  let title: string;
  let subtitle: string | undefined;
  if (f.kind === 'sourceFile') {
    const { moduleName, path } = f;
    title = moduleName;
    subtitle = path;
  } else {
    const { text, name } = f;
    title = text || name;
  }
  const toReturn: Parent = {
    type: 'root',
    children: [
      {
        type: 'heading',
        depth: 1,
        children: [
          {
            type: 'text',
            value: title
          }
        ]
      }
    ]
  };
  if (subtitle) {
    toReturn.children.push({
      type: 'paragraph',
      children: [
        {
          type: 'inlineCode',
          value: subtitle
        }
      ]
    });
  }
  return toReturn;
}
