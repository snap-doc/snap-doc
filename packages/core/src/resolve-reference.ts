import {
  FormattedSourceFile,
  FormattedSourceFileRef,
  FormattedSymbol,
  FormattedSymbolRef,
  FormattedType,
  FormattedTypeRef,
  FormatterRefRegistry
} from '@code-to-json/formatter';
import { FormatterOutputData } from '@code-to-json/formatter/lib/src/formatter';
import { AnyRef, refId, refType, UnreachableError } from '@code-to-json/utils';

export default function resolveReference(
  data: FormatterOutputData,
  ref: FormattedSymbolRef
): FormattedSymbol;
export default function resolveReference(
  data: FormatterOutputData,
  ref: FormattedTypeRef
): FormattedType;
export default function resolveReference(
  data: FormatterOutputData,
  ref: FormattedSourceFileRef
): FormattedSourceFile;
export default function resolveReference(
  data: FormatterOutputData,
  ref: AnyRef<FormatterRefRegistry>
): any {
  const refTyp = refType(ref);
  const id = refId(ref);
  switch (refTyp) {
    case 't':
      return data.types[id];
    case 's':
      return data.symbols[id];
    case 'f':
      return data.sourceFiles[id];
    default:
      throw new UnreachableError(refTyp);
  }
}
