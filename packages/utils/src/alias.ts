import { LinkedFormattedSymbol } from '@code-to-json/formatter-linker';
import { isAlias } from './guards';

export function resolveAlias(sym: LinkedFormattedSymbol): LinkedFormattedSymbol {
  if (!isAlias(sym)) return sym;
  const { aliasedSymbol, text } = sym;
  if (!aliasedSymbol)
    throw new Error(`Expected symbol with alias flag: "${text}" to have aliasedSymbol`);
  return resolveAlias(aliasedSymbol);
}
