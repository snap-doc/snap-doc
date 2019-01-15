import { Node } from 'unist';

/**
 * Create a section
 * @param level depth of section (heading level)
 * @param title title of section
 * @param content content within section
 * @private
 */
export function createSection(level: number, title: string | Node, content: Node[] = []): Node[] {
  return [
    {
      type: 'heading',
      depth: level,
      children: [typeof title === 'string' ? { type: 'text', value: title } : title]
    },
    ...content
  ];
}
