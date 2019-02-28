import * as remarkParse from 'remark-parse';
import * as remarkStringify from 'remark-stringify';
import * as unified from 'unified';
import parserOptions from './parser-options';
import stringifyOptions from './stringify-options';

const md = unified()
  .use(remarkParse, parserOptions)
  .use(remarkStringify, stringifyOptions);

export default md;
