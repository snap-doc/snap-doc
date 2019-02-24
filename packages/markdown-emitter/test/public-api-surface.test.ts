import { expect } from 'chai';
import { describe, it } from 'mocha';
import * as Exports from '../src/index';

describe('Public API surface tests', () => {
  it('expected exported items', () => {
    expect(Object.keys(Exports).sort()).to.deep.eq([
      'MarkdownFileEmitter',
      'MarkdownFileEmitterWorkspace',
    ]);

    expect(Exports.MarkdownFileEmitter).to.be.a('function', 'class MarkdownFileEmitter');
    expect(Exports.MarkdownFileEmitterWorkspace).to.be.a(
      'function',
      'class MarkdownFileEmitterWorkspace',
    );
  });
});
