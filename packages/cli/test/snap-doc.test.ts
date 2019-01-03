import { expect } from 'chai';
import { suite, test } from 'mocha-typescript';
import foo from '../src/index';

@suite
export class FirstTest {
  @test
  public async 'first test'(): Promise<void> {
    foo();
    expect(true).to.eql(true);
  }
}
