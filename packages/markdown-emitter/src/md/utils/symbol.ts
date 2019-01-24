import {
  FormattedSignature,
  FormattedSymbol,
  FormattedSymbolRef,
  FormattedType,
  FormattedTypeRef
} from '@code-to-json/formatter';
import { FormatterOutputData } from '@code-to-json/formatter/lib/src/formatter';
import { isDefined, UnreachableError } from '@code-to-json/utils';
import { Dict } from '@mike-north/types';
import { resolveReference } from '@snap-doc/core';
import { Node } from 'unist';
import { createDocumentation } from './documentation';
import { ExportKind } from './exports';
import { createSection } from './section';

function symbolConstructorSignatures(
  data: FormatterOutputData,
  sigs?: FormattedSignature[]
): string[] {
  if (!sigs || sigs.length === 0) {
    return [];
  } else {
    debugger;
  }
  return [];
}

// tslint:disable-next-line:no-identical-functions
function symbolCallSignatures(data: FormatterOutputData, sigs?: FormattedSignature[]): string[] {
  if (!sigs || sigs.length === 0) {
    return [];
  } else {
    debugger;
  }
  return [];
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

function symbolClassTypeDescription(
  data: FormatterOutputData,
  symbol: FormattedSymbol,
  type: FormattedType
): string {
  const { members = {}, properties = {} } = symbol;
  const { constructorSignatures, baseTypes } = type;
  if (baseTypes && baseTypes.length > 0) {
    debugger;
  }
  debugger;
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
                    return '';
                  }
                  const paramType = resolveReference(data, p.type);
                  return `${p.name}: ${paramType.text}`;
                })
                .join(', ')
            );
          }
          constructorParts.push(`): ${symbol.name}`);
          return constructorParts.join('');
        })
        .map(s => `  ${s}`)
    );
  }
  parts.push(...symbolProperties(data, properties));
  parts.push(...symbolProperties(data, members));
  parts.push('}');
  return parts.join('\n');
  // return symbolPropertyTypeDescription(data, symbol, type);
}

function symbolFunctionTypeDescription(
  data: FormatterOutputData,
  symbol: FormattedSymbol,
  type: FormattedType
): string {
  const { callSignatures } = type;
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
  const { name, flags } = symbol;
  const {
    callSignatures,
    constructorSignatures,
    numberIndexType: numberIndexTypeRef,
    stringIndexType: stringIndexTypeRef,
    properties = {},
    baseTypes,
    typeParameters: typeParameterRefs
  } = type;
  const { members } = symbol;
  const isInterface = flags ? flags.includes('interface') : false;
  let value: string = '';
  if (baseTypes && baseTypes.length > 0) {
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
    ...symbolProperties(data, members),
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
      const childKind = symbolKind(prop.flags);
      const { type: propTypeRef } = prop;
      if (propTypeRef) {
        const propType = resolveReference(data, propTypeRef);
        if (propType.flags && propType.flags.includes('typeParameter')) {
          return null;
        }
        return symbolTypeDescriptionCode(data, prop, propType, childKind);
      } else {
        return propName;
      }
    })
    .filter(isDefined);
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
