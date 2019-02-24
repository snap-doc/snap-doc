import { expect } from 'chai';
import { describe, it } from 'mocha';
import * as Exports from '../src/index';

describe('Public API surface tests', () => {
  it('expected exported items', async () => {
    expect(Object.keys(Exports).sort()).to.deep.eq([]);
  });
});
