import { expect } from 'chai';
import { describe, it } from 'mocha';
import * as Exports from '../src/index';

describe('Public API surface test', () => {
  it('expected exported items', async () => {
    expect(Object.keys(Exports).sort()).to.deep.eq(['abc']);

    expect(Exports.isAlias).to.be.a('function');
    expect(Exports.isClass).to.be.a('function');
    expect(Exports.isEnum).to.be.a('function');
    expect(Exports.isFunction).to.be.a('function');
    expect(Exports.isProperty).to.be.a('function');
    expect(Exports.isType).to.be.a('function');
    expect(Exports.resolveAlias).to.be.a('function');
  });
});
