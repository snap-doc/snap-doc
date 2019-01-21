import { expect } from 'chai';
import { suite, test } from 'mocha-typescript';
import { setupAcceptanceTest } from './helpers';

async function runAcceptanceTest(code: string, expectedComments: string): Promise<void> {
  const tc = await setupAcceptanceTest({
    'index.ts': code
  });
  expect(tc.contentFor('index.md')).to.eq(expectedComments);

  tc.cleanup();
}

@suite
class FirstAcceptance {
  @test.skip
  public async 'binary function with no return type'() {
    await runAcceptanceTest(
      `export function add(a: number, b: number) { return '' + a + b; }`,
      `# my-pkg

\`src/index\`

## Exports

### Functions

#### \`add(...)\`

\`\`\`ts
function add(a: number, b: number): string;
\`\`\``
    );
  }

  @test
  public async 'union type with core types'() {
    await runAcceptanceTest(
      `export const x: string | number = 44;`,
      `# my-pkg

\`src/index\`

## Exports

### Properties

#### \`x\`

\`\`\`ts
x: string | number
\`\`\``
    );
  }

  @test.skip
  public async 'exported interface'() {
    await runAcceptanceTest(
      `export interface Foo { val: string | number }`,
      `# my-pkg

\`src/index\`

## Exports

### Types

#### \`Foo\`

\`\`\`ts
interface Foo {
  val: string | number
}
\`\`\``
    );
  }

  @test.skip
  public async 'type alias'() {
    await runAcceptanceTest(
      `export type Dict = { [k: string]: number | undefined }`,
      `# my-pkg

\`src/index\`

## Exports

### Types

#### \`Dict\`

\`\`\`ts
type Dict = {
  [k: string]: number
}
\`\`\``
    );
  }
  @test.skip
  public async 'type alias w/ type parameter'() {
    await runAcceptanceTest(
      `export type Dict<T> = { [k: string]: T }`,
      `# my-pkg

\`src/index\`

## Exports

### Types

#### \`Dict\`

\`\`\`ts
type Dict<T> = {
  [k: string]: T
}
\`\`\``
    );
  }

  @test.skip
  public async 'type alias w/ type parameter and constraint'() {
    await runAcceptanceTest(
      `export interface Dict<T extends 'foo' | 'bar'> { [k: string]: T }`,
      `# my-pkg

\`src/index\`

## Exports

### Types

#### \`Dict\`

\`\`\`ts
interface Dict<T extends "foo" | "bar"> {
  [k: string]: T
}
\`\`\``
    );
  }

  @test.skip
  public async 'simple class w/ constructor'() {
    await runAcceptanceTest(
      `export class SimpleClass {
  constructor(bar: string) { console.log(bar); }    
}`,
      `# my-pkg

\`src/index\`

## Exports

### Classes

#### \`SimpleClass\`

\`\`\`ts
class SimpleClass {
  constructor(bar: string): SimpleClass
}
\`\`\``
    );
  }
}
