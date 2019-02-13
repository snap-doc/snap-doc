import {
  LinkedFormattedOutputData,
  LinkedFormattedSourceFile,
  LinkedFormattedSymbol
} from '@code-to-json/formatter-linker';
import { forEachDict } from '@code-to-json/utils-ts';
import { Dict } from '@mike-north/types';
import { DocDataSource } from '@snap-doc/types';

export default class DocData implements DocDataSource {
  protected slugs = new Map<LinkedFormattedSourceFile | LinkedFormattedSymbol, string>();

  constructor(public readonly data: Readonly<LinkedFormattedOutputData>) {}
  public prepare(): void {
    this.calculateSlugs();
  }

  public slugFor(entity: LinkedFormattedSourceFile | LinkedFormattedSymbol): string {
    const s = this.slugs.get(entity);
    if (!s) {
      throw new Error('Unable to create slug for: ' + entity.kind);
    }
    return s;
  }

  private calculateSlugs(): void {
    const { sourceFiles, symbols } = this.data;
    const duplicateWords: Dict<number> = {};
    forEachDict(sourceFiles, sf => {
      const word = sf.path;
      let ct: number;
      if (typeof duplicateWords[word] === 'undefined') {
        ct = duplicateWords[word] = 0;
      } else {
        // typeof duplicateWords[word] === 'number'
        ct = duplicateWords[word]!++;
      }
      this.slugs.set(sf, ct ? `${word}-${ct}` : word);
    });
    forEachDict(symbols, sym => {
      this.slugs.set(sym, sym.text || sym.name);
    });
  }
}
