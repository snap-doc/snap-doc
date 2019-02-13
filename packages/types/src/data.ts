import {
  LinkedFormattedOutputData,
  LinkedFormattedSourceFile,
  LinkedFormattedSymbol
} from '@code-to-json/formatter-linker';

export interface DocDataSource {
  readonly data: Readonly<LinkedFormattedOutputData>;
  prepare?: () => void | Promise<void>;
  slugFor: (entity: LinkedFormattedSourceFile | LinkedFormattedSymbol) => string;
}
