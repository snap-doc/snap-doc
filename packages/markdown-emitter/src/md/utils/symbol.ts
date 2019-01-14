import { FormattedSymbol, FormattedSymbolRef, FormattedType } from '@code-to-json/formatter';
import { FormatterOutputData } from '@code-to-json/formatter/lib/src/formatter';
import { isTruthy, UnreachableError } from '@code-to-json/utils';
import { Dict } from '@mike-north/types';
import { resolveReference } from '@snap-doc/core';
import { Node } from 'unist';
import { createDocumentation } from './documentation';
import { ExportKind } from './exports';
import { createSection } from './section';

function symbolTypeTypeDescription(
  data: FormatterOutputData,
  symbol: FormattedSymbol,
  type: FormattedType
): string {
  const { name, members = {}, flags } = symbol;
  const isInterface = flags ? flags.includes('interface') : false;
  let value: string = '';
  if (type.baseTypes && type.baseTypes.length > 0) {
    debugger;
  }
  if (isInterface) {
    value = [`interface ${name} {`, ...symbolMembers(data, members).map(s => `  ${s}`), '}'].join(
      '\n'
    );
  } else {
    value = `type ${name} = { }`;
  }
  return value;
}

function symbolClassTypeDescription(
  data: FormatterOutputData,
  symbol: FormattedSymbol,
  type: FormattedType
): string {
  const { constructorSignatures, members = {} } = symbol;
  const { baseTypes } = type;
  console.log('baseTypes', baseTypes);
  if (type.baseTypes && type.baseTypes.length > 0) {
    debugger;
  }
  const parts: string[] = [`class ${symbol.name} {`];
  if (constructorSignatures && constructorSignatures.length > 0) {
    parts.push(
      ...constructorSignatures
        .map(s => {
          const constructorParts: string[] = ['constructor('];
          const { parameters } = s;
          if (parameters && parameters.length > 0) {
            constructorParts.push(
              parameters
                .map(p => {
                  if (!p.type) {
                    return null;
                  }
                  const paramType = resolveReference(data, p.type);
                  return `${p.name}: ${paramType.text}`;
                })
                .filter(isTruthy)
                .join(', ')
            );
          }
          constructorParts.push(') {}');
          return constructorParts.join('');
        })
        .map(s => `  ${s}`)
    );
    parts.push(...symbolMembers(data, members).map(s => `  ${s}`));
    parts.push('}');
    return parts.join('\n');
  }
  return symbolPropertyTypeDescription(data, symbol, type);
}

function symbolTypeDescriptionCode(
  data: FormatterOutputData,
  symbol: FormattedSymbol,
  type: FormattedType,
  kind: ExportKind
): string {
  switch (kind) {
    case 'function':
      return symbolFunctionTypeDescription(data, symbol, type);
    case 'class':
      return symbolClassTypeDescription(data, symbol, type);
    case 'type':
      return symbolTypeTypeDescription(data, symbol, type);
    default:
      return symbolPropertyTypeDescription(data, symbol, type);
  }
}

function symbolTypeDescription(
  data: FormatterOutputData,
  symbol: FormattedSymbol,
  type: FormattedType,
  kind: ExportKind
): Node {
  return {
    type: 'paragraph',
    children: [
      { type: 'code', lang: 'ts', value: symbolTypeDescriptionCode(data, symbol, type, kind) }
    ]
  };
}

function symbolFunctionTypeDescription(
  data: FormatterOutputData,
  symbol: FormattedSymbol,
  type: FormattedType
): string {
  const { callSignatures } = symbol;
  if (callSignatures && callSignatures.length > 0) {
    return callSignatures
      .map(s => {
        const parts: string[] = ['function ', symbol.name, '('];
        const { parameters, returnType: returnTypeRef } = s;
        if (parameters && parameters.length > 0) {
          parts.push(
            parameters
              // tslint:disable-next-line:no-identical-functions
              .map(p => {
                if (!p.type) {
                  return null;
                }
                const paramType = resolveReference(data, p.type);
                return `${p.name}: ${paramType.text}`;
              })
              .filter(isTruthy)
              .join(', ')
          );
        }
        parts.push(')');
        if (returnTypeRef) {
          const returnType = resolveReference(data, returnTypeRef);
          parts.push(`: ${returnType.text}`);
        }
        parts.push(';');
        return parts.join('');
      })
      .join('\n');
  }
  return symbolPropertyTypeDescription(data, symbol, type);
}

function symbolPropertyTypeDescription(
  _data: FormatterOutputData,
  symbol: FormattedSymbol,
  type: FormattedType
): string {
  return [symbol.name, type.text].join(': ');
}

function symbolKind(flags?: string[]): ExportKind {
  if (!flags) {
    return 'property';
  }
  if (flags.includes('class')) {
    return 'class';
  }
  if (flags.includes('function')) {
    return 'function';
  }
  if (flags.includes('interface') || flags.includes('alias')) {
    return 'type';
  }
  return 'property';
}

function symbolMembers(data: FormatterOutputData, members: Dict<FormattedSymbolRef>): string[] {
  return Object.keys(members)
    .map(memName => {
      if (memName === '__constructor') {
        return null;
      }
      const memRef = members[memName];
      if (!memRef) {
        return null;
      }
      const mem = resolveReference(data, memRef);
      const childKind = symbolKind(mem.flags);
      const { type: memTypeRef } = mem;
      if (memTypeRef) {
        const memType = resolveReference(data, memTypeRef);
        return symbolTypeDescriptionCode(data, mem, memType, childKind);
      } else {
        return memName;
      }
    })
    .filter(isTruthy);
}

function sectionHeaderForSymbol(
  data: FormatterOutputData,
  s: FormattedSymbol,
  kind: ExportKind
): Node {
  switch (kind) {
    case 'property':
      return { type: 'inlineCode', value: s.name };
    case 'class':
      return { type: 'inlineCode', value: s.name };
    case 'type':
      return { type: 'inlineCode', value: s.name };
    case 'function':
      return { type: 'inlineCode', value: `${s.name}(...)` };
    default:
      throw new UnreachableError(kind);
  }
}

export function mdForSymbol(
  data: FormatterOutputData,
  s: FormattedSymbol,
  kind: ExportKind
): Node[] {
  const parts: Node[] = [];
  const { documentation } = s;
  parts.push(...createDocumentation(documentation));
  const { type: typeRef } = s;
  if (typeRef) {
    const type = resolveReference(data, typeRef);
    parts.push(symbolTypeDescription(data, s, type, kind));
  }
  return createSection(4, sectionHeaderForSymbol(data, s, kind), parts);
}
