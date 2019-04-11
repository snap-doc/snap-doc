import { LinkedFormattedSymbol } from '@code-to-json/formatter-linker';
import { Dict } from '@mike-north/types';
import { isAlias, isClass, isEnum, isFunction, isProperty, isType } from '@snap-doc/utils';
import * as debug from 'debug';

const log = debug('snap-doc:core:symbol-sorter');

export interface SortedExportSymbols {
  classes: Dict<LinkedFormattedSymbol>;
  properties: Dict<LinkedFormattedSymbol>;
  functions: Dict<LinkedFormattedSymbol>;
  types: Dict<LinkedFormattedSymbol>;
}

export function sortSymbols(
  exports: Exclude<LinkedFormattedSymbol['exports'], undefined>,
): SortedExportSymbols {
  const classes: Dict<LinkedFormattedSymbol> = {};
  const properties: Dict<LinkedFormattedSymbol> = {};
  const functions: Dict<LinkedFormattedSymbol> = {};
  const types: Dict<LinkedFormattedSymbol> = {};
  const unknown: Dict<LinkedFormattedSymbol> = {};

  function listForSym(sym: LinkedFormattedSymbol): Dict<LinkedFormattedSymbol> {
    if (isClass(sym) || isEnum(sym)) {
      return classes;
    }
    if (isType(sym)) {
      return types;
    }
    if (isProperty(sym)) {
      return properties;
    }
    if (isFunction(sym)) {
      return functions;
    }
    if (isAlias(sym)) {
      const { aliasedSymbol } = sym;
      if (!aliasedSymbol)
        throw new Error(`Expected alias (${sym.text}) to have a populated aliasedSymbol property`);
      return listForSym(aliasedSymbol);
    }
    let symbolStringified: string;
    try {
      symbolStringified = JSON.stringify(sym, null, '  ');
    } catch (_err) {
      symbolStringified = `${sym.name}`;
    }
    log(`WARNING: couldn't properly categorize symbol for sorting: ${symbolStringified}`);
    return unknown;
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
    types,
  };
}
