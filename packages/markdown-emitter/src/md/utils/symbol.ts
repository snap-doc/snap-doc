import {
  FormattedSignature,
  FormattedSymbol,
  FormattedSymbolRef,
  FormattedType,
  FormattedTypeRef
} from '@code-to-json/formatter';
import { FormatterOutputData } from '@code-to-json/formatter/lib/src/formatter';
import { FormattedSymbolKind, FormattedTypeKind } from '@code-to-json/formatter/lib/src/types';
import { isDefined, isNotNull, UnreachableError } from '@code-to-json/utils';
import { Dict } from '@mike-north/types';
import { resolveReference } from '@snap-doc/core';
import { Node } from 'unist';
import { createDocumentation } from './documentation';
import { createSection } from './section';

function symbolConstructorSignatures(
  data: FormatterOutputData,
  sigs?: FormattedSignature[]
): string[] {
  if (!sigs || sigs.length === 0) {
    return [];
  }
  return sigs
    .map(s => {
      const constructorParts: string[] = ['constructor('];
      const { parameters } = s;
      if (parameters && parameters.length > 0) {
        constructorParts.push(
          parameters
            .map(p => {
              if (!p.type) {
                return '';
              }
              const paramType = resolveReference(data, p.type);
              return `${p.name}: ${paramType.text}`;
            })
            .join(', ')
        );
      }
      if (s.returnType) {
        const returnType = resolveReference(data, s.returnType);

        constructorParts.push(`): ${returnType.text}`);
      } else {
        constructorParts.push(`): (unknown)`);
      }
      return constructorParts.join('');
    })
    .map(s => `  ${s}`);
}

// tslint:disable-next-line:no-identical-functions
function symbolCallSignatures(data: FormatterOutputData, sigs?: FormattedSignature[]): string[] {
  if (!sigs || sigs.length === 0) {
    return [];
  }
  return sigs.map(s => {
    const parts: string[] = ['('];
    const { parameters, returnType: returnTypeRef } = s;
    if (parameters && parameters.length > 0) {
      parts.push(
        parameters
          // tslint:disable-next-line:no-identical-functions
          .map(p => {
            if (!p.type) {
              return '';
            }
            const paramType = resolveReference(data, p.type);
            return `${p.name}: ${paramType.text}`;
          })
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
  });
}

// tslint:disable-next-line:no-identical-functions
function symbolIndexSignature(indexType: 'string' | 'number', sig?: FormattedType): string[] {
  if (!sig) {
    return [];
  } else {
    return [`[k: ${indexType}]: ${sig.text}`];
  }
}

function symbolTypeDescription(
  data: FormatterOutputData,
  symbol: FormattedSymbol,
  type: FormattedType
): Node {
  return {
    type: 'paragraph',
    children: [{ type: 'code', lang: 'ts', value: symbolTypeDescriptionCode(data, symbol, type) }]
  };
}

function symbolClassTypeDescription(
  data: FormatterOutputData,
  symbol: FormattedSymbol,
  type: FormattedType
): string {
  const { members = {}, properties = {} } = symbol;
  const { constructorSignatures, baseTypes } = type;
  // tslint:disable-next-line:no-debugger
  if (baseTypes && baseTypes.length > 0) {
    // tslint:disable-next-line:no-debugger
    debugger;
  }
  const parts: string[] = [`class ${symbol.text} {`];
  parts.push(...symbolConstructorSignatures(data, constructorSignatures));

  parts.push(...symbolProperties(data, properties).map(s => `  ${s}`));
  parts.push(...symbolProperties(data, members).map(s => `  ${s}`));
  parts.push('}');
  return parts.join('\n');
}

function symbolFunctionTypeDescription(
  data: FormatterOutputData,
  symbol: FormattedSymbol,
  type: FormattedType
): string {
  const { callSignatures } = type;
  return symbolCallSignatures(data, callSignatures)
    .map(cs => `function ${symbol.text}${cs}`)
    .join('\n');
}

function symbolPropertyTypeDescription(
  _data: FormatterOutputData,
  symbol: FormattedSymbol,
  type: FormattedType
): string {
  return [symbol.name, type.text].join(': ');
}

function makeTypeParamString(
  data: FormatterOutputData,
  aliasTypeArgumentRefs?: FormattedTypeRef[]
): string {
  if (!aliasTypeArgumentRefs || aliasTypeArgumentRefs.length === 0) {
    return '';
  }
  const typeParams: Array<{ type: string; constraint: string }> = !aliasTypeArgumentRefs
    ? []
    : aliasTypeArgumentRefs
        .map(t => resolveReference(data, t))
        .filter(isDefined)
        .map(t => ({
          type: t.text,
          constraint: t.constraint ? resolveReference(data, t.constraint).text : ''
        }));
  if (!typeParams) {
    return '';
  }
  const typeParamString: string = typeParams
    .map(tp => {
      const constraintStr = tp.constraint ? ` extends ${tp.constraint}` : '';
      return `${tp.type}${constraintStr}`;
    })
    .join(', ');
  return `<${typeParamString}>`;
}

function symbolTypeTypeDescription(
  data: FormatterOutputData,
  symbol: FormattedSymbol,
  type: FormattedType
): string {
  const { name, kind } = symbol;
  const {
    callSignatures,
    constructorSignatures,
    numberIndexType: numberIndexTypeRef,
    stringIndexType: stringIndexTypeRef,
    properties = {},
    baseTypes,
    typeParameters: typeParameterRefs
  } = type;
  // const { members } = symbol;
  const isInterface = kind === FormattedSymbolKind.interface;
  let value: string = '';
  if (baseTypes && baseTypes.length > 0) {
    // tslint:disable-next-line:no-debugger
    debugger;
  }
  const numberIndexType = !numberIndexTypeRef
    ? undefined
    : resolveReference(data, numberIndexTypeRef);
  const stringIndexType = !stringIndexTypeRef
    ? undefined
    : resolveReference(data, stringIndexTypeRef);

  const commonParts: string[] = [
    ...symbolConstructorSignatures(data, constructorSignatures),
    ...symbolCallSignatures(data, callSignatures),
    ...symbolIndexSignature('number', numberIndexType),
    ...symbolIndexSignature('string', stringIndexType),
    ...symbolProperties(data, properties)
  ].map(s => `  ${s}`);
  const typeParamString = makeTypeParamString(data, typeParameterRefs);
  if (isInterface) {
    value = [`interface ${name}${typeParamString} {`, ...commonParts, '}'].join('\n');
  } else {
    value = [`type ${name}${typeParamString} = {`, ...commonParts, `}`].join('\n');
  }
  return value;
}

function symbolTypeDescriptionCode(
  data: FormatterOutputData,
  symbol: FormattedSymbol,
  type: FormattedType
): string {
  switch (symbol.kind) {
    case FormattedSymbolKind.function:
      return symbolFunctionTypeDescription(data, symbol, type);
    case FormattedSymbolKind.class:
      return symbolClassTypeDescription(data, symbol, type);
    case FormattedSymbolKind.interface:
    case FormattedSymbolKind.typeAlias:
      return symbolTypeTypeDescription(data, symbol, type);
    default:
      return symbolPropertyTypeDescription(data, symbol, type);
  }
}
export function symbolProperties(
  data: FormatterOutputData,
  props?: Dict<FormattedSymbolRef>
): string[] {
  if (!props) {
    return [];
  }
  return Object.keys(props)
    .map(propName => {
      const propRef = props[propName];
      if (!propRef) {
        return null;
      }
      const prop = resolveReference(data, propRef);
      const { type: propTypeRef } = prop;
      if (propTypeRef) {
        const propType = resolveReference(data, propTypeRef);
        if (propType.kind === FormattedTypeKind.typeParameter) {
          return null;
        }
        return [prop.accessModifier, symbolTypeDescriptionCode(data, prop, propType)]
          .join(' ')
          .trim();
      } else {
        return propName;
      }
    })
    .filter(isDefined)
    .filter(isNotNull);
}

function sectionHeaderForSymbol(_data: FormatterOutputData, s: FormattedSymbol): Node {
  switch (s.kind) {
    case FormattedSymbolKind.enum:
    case FormattedSymbolKind.enumMember:
    case FormattedSymbolKind.constEnum:
    case FormattedSymbolKind.property:
    case FormattedSymbolKind.method:
    case FormattedSymbolKind.module:
    case FormattedSymbolKind.typeParameter:
      throw new Error(`Should not receive symbol kind ${s.kind}`);
    case FormattedSymbolKind.variable:
    case FormattedSymbolKind.typeAlias:
    case FormattedSymbolKind.typeLiteral:
    case FormattedSymbolKind.interface:
    case FormattedSymbolKind.class:
      return { type: 'inlineCode', value: s.name };
    case FormattedSymbolKind.function:
      return { type: 'inlineCode', value: `${s.name}(...)` };
    default:
      throw new UnreachableError(s.kind);
  }
}

export function mdForSymbol(data: FormatterOutputData, s: FormattedSymbol): Node[] {
  const parts: Node[] = [];
  const { documentation } = s;
  parts.push(...createDocumentation(documentation));
  const { type: typeRef } = s;
  if (typeRef) {
    const type = resolveReference(data, typeRef);
    parts.push(symbolTypeDescription(data, s, type));
  }
  return createSection(4, sectionHeaderForSymbol(data, s), parts);
}
