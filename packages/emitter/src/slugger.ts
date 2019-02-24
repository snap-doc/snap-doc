import {
  LinkedFormattedOutputData,
  LinkedFormattedSourceFile,
  LinkedFormattedSymbol,
} from '@code-to-json/formatter-linker';
import { forEachDict } from '@code-to-json/utils-ts';
import { Dict } from '@mike-north/types';
import * as debug from 'debug';

const log = debug('snap-doc:slugger');

export type SluggedEntities = 'class' | 'type' | 'sourceFile';
export type Sluggable = LinkedFormattedSourceFile | LinkedFormattedSymbol;
export default class Slugger {
  protected slugs = new Map<LinkedFormattedSourceFile | LinkedFormattedSymbol, string>();

  constructor(protected readonly data: Readonly<LinkedFormattedOutputData>) {}

  public async prepare(): Promise<void> {
    log('calculating slugs...');
    this.calculateSlugs();
  }

  public slugFor(entity: Sluggable): string {
    const s = this.slugs.get(entity);
    if (!s) {
      throw new Error(`No slug found for entity: ${entity.kind}`);
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
        ct = 0;
        duplicateWords[word] = ct;
      } else {
        // typeof duplicateWords[word] === 'number'
        ct = (duplicateWords[word] as number)++;
      }
      this.slugs.set(sf, ct ? `${word}-${ct}` : word);
    });
    forEachDict(symbols, sym => {
      this.slugs.set(sym, sym.text || sym.name);
    });
  }
}
