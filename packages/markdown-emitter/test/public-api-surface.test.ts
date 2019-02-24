import { expect } from 'chai';
import { suite, test } from 'mocha-typescript';
import * as Exports from '../src/index';

@suite
export class PublicApiSurfaceTest {
  @test
  public async 'expected exported items'(): Promise<void> {
    expect(Object.keys(Exports).sort()).to.deep.eq([
      'MarkdownFileEmitter',
      'MarkdownFileEmitterWorkspace',
    ]);

    expect(Exports.MarkdownFileEmitter).to.be.a('function', 'class MarkdownFileEmitter');
    expect(Exports.MarkdownFileEmitterWorkspace).to.be.a(
      'function',
      'class MarkdownFileEmitterWorkspace',
    );
  }
}
