import { FormattedSourceFile, FormattedSymbol } from '@code-to-json/formatter';
import { FormatterOutputData } from '@code-to-json/formatter/lib/src/formatter';
import { Dict } from '@mike-north/types';
import resolveReference from './resolve-reference';

export function isClass(sym: FormattedSymbol): boolean {
  return !!sym.flags && sym.flags.includes('class');
}

export function isType(sym: FormattedSymbol): boolean {
  return !!sym.flags && (sym.flags.includes('alias') || sym.flags.includes('interface'));
}

export function isFunction(sym: FormattedSymbol): boolean {
  return !!sym.flags && sym.flags.includes('function');
}

export function isProperty(sym: FormattedSymbol): boolean {
  return !!sym.flags && sym.flags.includes('variable');
}

export interface SortedExportSymbols {
  classes: Dict<FormattedSymbol>;
  properties: Dict<FormattedSymbol>;
  functions: Dict<FormattedSymbol>;
  types: Dict<FormattedSymbol>;
}

export function sortSymbols(
  fd: FormatterOutputData,
  exports: Exclude<FormattedSourceFile['exports'], undefined>
): SortedExportSymbols {
  const classes: Dict<FormattedSymbol> = {};
  const properties: Dict<FormattedSymbol> = {};
  const functions: Dict<FormattedSymbol> = {};
  const types: Dict<FormattedSymbol> = {};

  function listForSym(sym: FormattedSymbol): Dict<FormattedSymbol> {
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
    const expRef = exports[name];
    if (!expRef) {
      throw new Error(`Invalid FormatterOutput reference for export: ${name}`);
    }
    const exp = resolveReference(fd, expRef);
    listForSym(exp)[name] = exp;
  });

  return {
    classes,
    properties,
    functions,
    types
  };
}
