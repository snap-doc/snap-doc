import { LinkedFormattedSymbol } from '@code-to-json/formatter-linker';
import { Dict } from '@mike-north/types';
import { isClass, isProperty, isFunction, isType } from './guards';

export interface SortedExportSymbols {
  classes: Dict<LinkedFormattedSymbol>;
  properties: Dict<LinkedFormattedSymbol>;
  functions: Dict<LinkedFormattedSymbol>;
  types: Dict<LinkedFormattedSymbol>;
}

export function sortSymbols(
  exports: Exclude<LinkedFormattedSymbol['exports'], undefined>
): SortedExportSymbols {
  const classes: Dict<LinkedFormattedSymbol> = {};
  const properties: Dict<LinkedFormattedSymbol> = {};
  const functions: Dict<LinkedFormattedSymbol> = {};
  const types: Dict<LinkedFormattedSymbol> = {};

  function listForSym(sym: LinkedFormattedSymbol): Dict<LinkedFormattedSymbol> {
    if (isClass(sym)) {
      return classes;
    } else if (isType(sym)) {
      return types;
    } else if (isProperty(sym)) {
      return properties;
    } else if (isFunction(sym)) {
      return functions;
    } else {
      throw new Error(
        `Couldn't properly categorize symbol for sorting: ${JSON.stringify(sym, null, '  ')}`
      );
    }
  }

  Object.keys(exports).forEach(name => {
    const exp = exports[name];
    if (!exp) {
      throw new Error(`Invalid FormatterOutput reference for export: ${name}`);
    }
    listForSym(exp)[name] = exp;
  });

  return {
    classes,
    properties,
    functions,
    types
  };
}
