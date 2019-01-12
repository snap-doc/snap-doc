import { CommentData } from '@code-to-json/comments';

export interface DocData {
  files: DocDataFile[];
}

export interface DocDataFile {
  name: string;
  pathInPackage: string;
  documentation?: CommentData;
}
