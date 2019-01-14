import { CommentData } from '@code-to-json/comments';
import { FormattedSignature, FormattedTypeRef, FormatterOutput } from '@code-to-json/formatter';

// export interface DocData {
//   files: DocDataFile[];
//   formatterOutput: FormatterOutput;
// }

// export interface DocDataSymbol {
//   name: string;
//   flags: string[];
//   members: DocDataSymbolCollection;
//   callSignatures?: FormattedSignature[];
//   constructorSignatures?: FormattedSignature[];
//   documentation?: CommentData;
//   type?: FormattedTypeRef;
// }

// export interface DocDataSymbolCollection {
//   [k: string]: DocDataSymbol;
// }

// export interface DocDataFile {
//   name: string;
//   pathInPackage: string;
//   documentation?: CommentData;
//   extension: string | null;
//   exports: {
//     classes: DocDataSymbolCollection;
//     functions: DocDataSymbolCollection;
//     properties: DocDataSymbolCollection;
//     types: DocDataSymbolCollection;
//   };
// }
