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
class BasicAcceptance {
  @test
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

  @test
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

  @test
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
  @test
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

  @test
  public async 'interface w/ type parameter '() {
    await runAcceptanceTest(
      `export interface Dict<T> { [k: string]: T }`,
      `# my-pkg

\`src/index\`

## Exports

### Types

#### \`Dict\`

\`\`\`ts
interface Dict<T> {
  [k: string]: T
}
\`\`\``
    );
  }

  @test
  public async 'interface w/ type parameter and constraint'() {
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

  @test
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

  @test
  public async 'const symbols should get narrow types of the symbol value'() {
    await runAcceptanceTest(
      `export const TextType = "Text";`,
      `# my-pkg

\`src/index\`

## Exports

### Properties

#### \`TextType\`

\`\`\`ts
TextType: "Text"
\`\`\``
    );
  }
  @test
  public async 'let symbols should get narrow types of the symbol value'() {
    await runAcceptanceTest(
      `export let TextType = "Text";`,
      `# my-pkg

\`src/index\`

## Exports

### Properties

#### \`TextType\`

\`\`\`ts
TextType: string
\`\`\``
    );
  }
  @test.skip
  public async 'symbol type checker -> type of symbol (1)'() {
    await runAcceptanceTest(
      `const MySymbol = "Text";
export type TextType = typeof MySymbol;`,
      `# my-pkg

\`src/index\`

## Exports

### Properties

#### \`TextType\`

\`\`\`ts
type TextType = "Text"
\`\`\``
    );
  }

  @test.skip
  public async 'symbol type checker -> type of symbol (2)'() {
    await runAcceptanceTest(
      `const TextType = "Text";
type TextType = typeof TextType;
const ElementType = "Element";
type ElementType = typeof ElementType;
export type NodeType = ElementType | TextType;`,
      `# my-pkg

\`src/index\`

## Exports

### Types

#### \`NodeType\`

\`\`\`ts
type NodeType = "Element" | "Text"
\`\`\``
    );
  }

  @test
  public async 'symbol type checker -> type of symbol (3)'() {
    await runAcceptanceTest(
      `const TextType = "Text";
type TextType = typeof TextType;
const ElementType = "Element";
type ElementType = typeof ElementType;
type NodeType = ElementType | TextType;
export const DefaultType: NodeType = ElementType;`,
      `# my-pkg

\`src/index\`

## Exports

### Properties

#### \`DefaultType\`

\`\`\`ts
DefaultType: NodeType
\`\`\``
    );
  }
}
