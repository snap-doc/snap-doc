import { LinkedFormattedSymbol } from '@code-to-json/formatter-linker';

export function isClass(sym: LinkedFormattedSymbol): boolean {
  return !!(sym.flags && sym.flags.includes('class'));
}

export function isType(sym: LinkedFormattedSymbol): boolean {
  return !!(sym.flags && (sym.flags.includes('interface') || sym.flags.includes('typeAlias')));
}

export function isFunction(sym: LinkedFormattedSymbol): boolean {
  return !!(sym.flags && sym.flags.includes('function'));
}

export function isProperty(sym: LinkedFormattedSymbol): boolean {
  return !!(sym.flags && sym.flags.includes('variable'));
}
