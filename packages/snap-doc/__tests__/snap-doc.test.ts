import { expect } from 'chai';
import { suite, test } from 'mocha-typescript';

@suite
export class FirstTest {
  @test
  public async 'first test'(): Promise<void> {
    expect(true).to.eql(true);
  }
}
