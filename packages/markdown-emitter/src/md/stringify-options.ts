import { RemarkStringifyOptions } from 'remark-stringify/types';

export default {
  gfm: true,
  bullet: '*',
  fences: true,
  incrementListMarker: false
} as Partial<RemarkStringifyOptions>;
