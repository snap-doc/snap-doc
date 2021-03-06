import {
  LinkedFormattedSignature,
  LinkedFormattedSymbol,
  LinkedFormattedType,
} from '@code-to-json/formatter-linker';
import { isDefined } from '@code-to-json/utils';
import { Dict } from '@mike-north/types';
import {
  blockquote,
  code,
  heading,
  inlineCode,
  link,
  list,
  listItem,
  paragraph,
  separator,
  strong,
  text,
} from 'mdast-builder';
import { Node } from 'unist';
import { FileEmitterWorkspace, Pathable } from '@snap-doc/emitter';
import { createDocumentationForCommentData } from './comment-data';
import { mdSignatures } from './signature';
import MarkdownEmitterState from '../../emitter/state';

export interface MDSymbolOptions {
  includeDetails?: boolean;
  includeTitle?: boolean;
  baseDepth?: number;
}

function mdForSymbolTitle(
  state: MarkdownEmitterState,
  w: FileEmitterWorkspace,
  sym: LinkedFormattedSymbol,
  opts: MDSymbolOptions,
): Node[] {
  const { includeTitle } = opts;
  if (!includeTitle) {
    return [];
  }
  const sName = sym.text || sym.name;
  const url = opts.includeDetails ? undefined : w.pathFor(state, sym, state.ext);
  const title = inlineCode(sName);
  if (url) {
    return [heading(opts.baseDepth || 1, link(url, sName, title))];
  }
  return [heading(opts.baseDepth || 1, title)];
}

function mdForSymbolSignatures(
  s: LinkedFormattedSymbol,
  sigs: LinkedFormattedSignature[] | undefined,
  head: Node[],
): Node[] {
  const parts: Node[] = [];

  if (sigs && sigs.length > 0) {
    if (sigs.length > 1) {
      parts.push(...head);
    }

    parts.push(strong(text('Signatures')), ...mdSignatures(s, sigs));
  }
  return parts;
}

function mdForProperties(props: Dict<LinkedFormattedSymbol>, opts: MDSymbolOptions): Node[] {
  return Object.keys(props)
    .map(p => props[p])
    .filter(isDefined)
    .reduce(
      (lst, p) => {
        lst.push(
          heading((opts.baseDepth || 1) + 1, text(p.text || p.name)),
          blockquote(() => {
            const parts: Node[] = [];
            const { valueType, documentation } = p;
            if (valueType) {
              parts.push(code('ts', valueType.text));
            }
            if (documentation) {
              parts.push(...createDocumentationForCommentData(documentation));
            }
            return parts;
          }),
        );
        return lst;
      },
      [] as Node[],
    );
}

export function mdForSymbolType(
  s: LinkedFormattedSymbol,
  type: LinkedFormattedType,
  opts: MDSymbolOptions,
): Node[] {
  const parts: Node[] = [];
  const { flags } = s;
  const {
    callSignatures,
    constructorSignatures,
    properties,
    stringIndexType,
    numberIndexType,
    typeParameters,
  } = type;
  if (flags && (flags.includes('variable') || flags.includes('typeAlias')))
    parts.push(blockquote(code('ts', type.text)));
  if (typeParameters) {
    parts.push(
      paragraph(strong(text('Type Parameters'))),
      list(
        'unordered',
        typeParameters.map(tp =>
          listItem(() =>
            paragraph(() => {
              const { constraint } = tp;
              const typeLabelParts: string[] = [tp.text];
              if (constraint) {
                typeLabelParts.push('extends', constraint.text);
              }
              return inlineCode(`<${typeLabelParts.join(' ')}>`);
            }),
          ),
        ),
      ),
    );
  }
  parts.push(
    ...mdForSymbolSignatures(s, callSignatures, [
      heading((opts.baseDepth || 1) + 1, text('Call Signatures')),
    ]),
  );
  parts.push(
    ...mdForSymbolSignatures(s, constructorSignatures, [
      heading((opts.baseDepth || 1) + 1, text('Constructor Signatures')),
    ]),
  );
  if (properties) {
    parts.push(...mdForProperties(properties, opts));
  }

  if (stringIndexType) {
    parts.push(blockquote(code('ts', `[k: string]: ${stringIndexType.text}`)));
  }
  if (numberIndexType) {
    parts.push(blockquote(code('ts', `[k: number]: ${numberIndexType.text}`)));
  }

  return parts;
}

export function mdForSymbolDetails(s: LinkedFormattedSymbol, opts: MDSymbolOptions): Node[] {
  const { includeDetails } = opts;
  if (!includeDetails) {
    return [];
  }
  const { valueType, type } = s;
  const parts: Node[] = [];

  if (valueType) {
    parts.push(...mdForSymbolType(s, valueType, opts));
  }
  if (type) {
    parts.push(...mdForSymbolType(s, type, opts));
  }
  return parts;
}

function mdForBaseTypes(
  state: MarkdownEmitterState,
  w: FileEmitterWorkspace,
  _s: LinkedFormattedSymbol,
  pageItem: Pathable,
  type: LinkedFormattedType | undefined,
): Node {
  if (!type || !type.baseTypes) {
    return text('');
  }

  return paragraph([
    text(' '),
    inlineCode('extends'),
    text(' '),
    ...type.baseTypes.reverse().map(bt =>
      // bt.symbol ? inlineCode(bt.symbol.text || bt.symbol.name) : inlineCode('(unknown symbol)'),
      bt.symbol
        ? link(
            w.relativePath(state, pageItem, bt.symbol, 'md'),
            bt.symbol.text || bt.symbol.name,
            inlineCode(bt.symbol.text || bt.symbol.name),
          )
        : inlineCode('(unknown symbol)'),
    ),
  ]);
}

function mdForSymbolHeader(
  state: MarkdownEmitterState,
  w: FileEmitterWorkspace,
  s: LinkedFormattedSymbol,
  pageItem: Pathable,
): Node {
  const { flags, type, accessModifier } = s;
  const kids: Node[] = [];
  if (accessModifier) {
    kids.push(inlineCode(accessModifier), text(' '));
  }
  if (flags) {
    kids.push(
      ...flags.reduce(
        (all, f, i) => {
          all.push(inlineCode(f));
          if (i < flags.length - 1) {
            all.push(text(', '));
          }
          return all;
        },
        [] as Node[],
      ),
    );
  }
  kids.push(mdForBaseTypes(state, w, s, pageItem, type));

  if (kids.length === 0) {
    return text('');
  }
  return paragraph(kids);
}

export function mdForSymbol(
  state: MarkdownEmitterState,
  w: FileEmitterWorkspace,
  s: LinkedFormattedSymbol,
  pageItem: Pathable,
  opts: MDSymbolOptions,
): Node[] {
  const { documentation } = s;

  const parts: Node[] = [separator];
  parts.push(...mdForSymbolTitle(state, w, s, opts));
  parts.push(mdForSymbolHeader(state, w, s, pageItem));
  if (documentation) {
    parts.push(paragraph(createDocumentationForCommentData(documentation)));
  }
  parts.push(...mdForSymbolDetails(s, opts));
  return parts;
}
