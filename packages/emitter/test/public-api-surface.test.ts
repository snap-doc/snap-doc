import { expect } from 'chai';
import { describe, it } from 'mocha';
import * as Exports from '../src/index';

describe('Public API surface tests', () => {
  it('expected exported items', async () => {
    expect(Object.keys(Exports).sort()).to.deep.eq([
      'Emitter',
      'EmitterState',
      'EmitterWorkspace',
      'FileEmitter',
      'FileEmitterWorkspace',
    ]);

    expect(Exports.Emitter).to.be.a('function', 'class Emitter');
    expect(Exports.FileEmitter).to.be.a('function', 'class FileEmitter');
  });
});
