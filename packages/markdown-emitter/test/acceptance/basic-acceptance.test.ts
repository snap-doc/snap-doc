import { expect } from 'chai';
import { slow, suite, test } from 'mocha-typescript';
import { setupAcceptanceTest } from './helpers';

async function runAcceptanceTest(code: string, expectedComments: string): Promise<void> {
  const tc = await setupAcceptanceTest({
    'index.ts': code,
  });
  expect(tc.contentFor('modules/index.ts.md')).to.eq(expectedComments);

  tc.cleanup();
}

@suite
@slow(1500)
export class BasicAcceptance {
  @test
  public async 'binary function with no return type'() {
    await runAcceptanceTest(
      `export function add(a: number, b: number) { return '' + a + b; }`,
      `# \`my-pkg\`

## Exports

### Functions

---

#### \`add\`

\`function\`

\`(a: number, b: number): string\``,
    );
  }

  @test
  public async 'function with overloaded signatures'() {
    await runAcceptanceTest(
      `
export function add(a: number, b: number): number;
export function add(a: string, b: string): string;
export function add(a: any, b: any): any {
  return a + b;
}
`,
      `# \`my-pkg\`

## Exports

### Functions

---

#### \`add\`

\`function\`

##### Call Signatures

\`(a: number, b: number): number\`

\`(a: string, b: string): string\``,
    );
  }

  @test
  public async 'union type with core types'() {
    await runAcceptanceTest(
      `export const x: string | number = 44;`,
      `# \`my-pkg\`

## Exports

### Properties

---

#### \`x\`

\`variable\`

> \`\`\`ts
> string | number
> \`\`\``,
    );
  }

  @test
  public async 'exported interface'() {
    await runAcceptanceTest(
      `export interface Foo { val: string | number }`,
      `# \`my-pkg\`

## Exports

### Types

---

#### \`Foo\`

\`interface\`

##### val

> \`\`\`ts
> string | number
> \`\`\``,
    );
  }

  @test
  public async 'type alias'() {
    await runAcceptanceTest(
      `export type Dict = { [k: string]: number | undefined }`,
      `# \`my-pkg\`

## Exports

### Types

---

#### \`Dict\`

\`typeAlias\`

> \`\`\`ts
> Dict
> \`\`\`

> \`\`\`ts
> [k: string]: number
> \`\`\``,
    );
  }
  @test
  public async 'type alias w/ type parameter'() {
    await runAcceptanceTest(
      `export type Dict<T> = { [k: string]: T }`,
      `# \`my-pkg\`

## Exports

### Types

---

#### \`Dict\`

\`typeAlias\`

> \`\`\`ts
> Dict<T>
> \`\`\`

**Type Parameters**

*   \`<T>\`

> \`\`\`ts
> [k: string]: T
> \`\`\``,
    );
  }

  @test
  public async 'interface w/ type parameter '() {
    await runAcceptanceTest(
      `export interface Dict<T> { [k: string]: T }`,
      `# \`my-pkg\`

## Exports

### Types

---

#### \`Dict\`

\`interface\`

**Type Parameters**

*   \`<T>\`

> \`\`\`ts
> [k: string]: T
> \`\`\``,
    );
  }

  @test
  public async 'interface w/ type parameter and constraint'() {
    await runAcceptanceTest(
      `export interface Dict<T extends 'foo' | 'bar'> { [k: string]: T }`,
      `# \`my-pkg\`

## Exports

### Types

---

#### \`Dict\`

\`interface\`

**Type Parameters**

*   \`<T extends "foo" | "bar">\`

> \`\`\`ts
> [k: string]: T
> \`\`\``,
    );
  }

  @test
  public async 'simple class w/ constructor'() {
    await runAcceptanceTest(
      `export class SimpleClass {
  constructor(bar: string) { console.log(bar); }
}`,
      `# \`my-pkg\`

## Exports

### Classes

---

#### \`SimpleClass\`

\`class\`

\`(bar: string): SimpleClass\``,
    );
  }

  @test
  public async 'simple class w/ constructor and fields'() {
    await runAcceptanceTest(
      `export class SimpleClass {
  public foo: string = 'bar';
  private biz: string[] = ['baz'];
  constructor(bar: string) { console.log(bar); }
}`,
      `# \`my-pkg\`

## Exports

### Classes

---

#### \`SimpleClass\`

\`class\`

\`(bar: string): SimpleClass\`

##### foo

> \`\`\`ts
> string
> \`\`\`

##### biz

> \`\`\`ts
> string[]
> \`\`\``,
    );
  }

  @test
  public async 'class with exported base class'() {
    await runAcceptanceTest(
      `
export class SimpleBase { foo: string }
export class SimpleClass extends SimpleBase {
  constructor(bar: string) { console.log(bar); }
}`,
      `# \`my-pkg\`

## Exports

### Classes

---

#### \`SimpleBase\`

\`class\`

\`(): SimpleBase\`

##### foo

> \`\`\`ts
> string
> \`\`\`

---

#### \`SimpleClass\`

\`class\` \`extends\` \`SimpleBase\`

\`(bar: string): SimpleClass\`

##### foo

> \`\`\`ts
> string
> \`\`\``,
    );
  }

  @test
  public async 'class with non-exported base class'() {
    await runAcceptanceTest(
      `
class SimpleBase { foo: string }
export class SimpleClass extends SimpleBase {
  constructor(bar: string) { console.log(bar); }
}`,
      `# \`my-pkg\`

## Exports

### Classes

---

#### \`SimpleClass\`

\`class\` \`extends\` \`SimpleBase\`

\`(bar: string): SimpleClass\`

##### foo

> \`\`\`ts
> string
> \`\`\``,
    );
  }

  @test
  public async 'simple class w/ constructor - export default'() {
    await runAcceptanceTest(
      `export default class SimpleClass {
  public foo: string = 'my class field'
  constructor(bar: string) { console.log(bar); }
}`,
      `# \`my-pkg\`

## Exports

### Classes

---

#### \`SimpleClass\`

\`class\`

\`(bar: string): SimpleClass\`

##### foo

> \`\`\`ts
> string
> \`\`\``,
    );
  }

  @test
  public async 'const symbols should get narrow types of the symbol value'() {
    await runAcceptanceTest(
      `export const TextType = "Text";`,
      `# \`my-pkg\`

## Exports

### Properties

---

#### \`TextType\`

\`variable\`

> \`\`\`ts
> "Text"
> \`\`\``,
    );
  }
  @test
  public async 'let symbols should get narrow types of the symbol value'() {
    await runAcceptanceTest(
      `export let TextType = "Text";`,
      `# \`my-pkg\`

## Exports

### Properties

---

#### \`TextType\`

\`variable\`

> \`\`\`ts
> string
> \`\`\``,
    );
  }
  @test
  public async 'symbol type checker -> type of symbol (1)'() {
    await runAcceptanceTest(
      `const MySymbol = "Text";
export type TextType = typeof MySymbol;`,
      `# \`my-pkg\`

## Exports

### Types

---

#### \`TextType\`

\`typeAlias\`

> \`\`\`ts
> "Text"
> \`\`\``,
    );
  }

  @test
  public async 'symbol type checker -> type of symbol (2)'() {
    await runAcceptanceTest(
      `const TextType = "Text";
type TextType = typeof TextType;
const ElementType = "Element";
type ElementType = typeof ElementType;
export type NodeType = ElementType | TextType;`,
      `# \`my-pkg\`

## Exports

### Types

---

#### \`NodeType\`

\`typeAlias\`

> \`\`\`ts
> NodeType
> \`\`\``,
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
      `# \`my-pkg\`

## Exports

### Properties

---

#### \`DefaultType\`

\`variable\`

> \`\`\`ts
> NodeType
> \`\`\``,
    );
  }
}
