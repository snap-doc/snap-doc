import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupAcceptanceTest } from './helpers';

async function runAcceptanceTest(code: string, expectedComments: string): Promise<void> {
  const tc = await setupAcceptanceTest({
    'index.ts': code,
  });
  expect(tc.contentFor('modules/index.ts.md')).to.eq(expectedComments);

  tc.cleanup();
}

describe('single-file acceptance tests', () => {
  it('binary function with no return type', async () => {
    await runAcceptanceTest(
      `export function add(a: number, b: number) { return '' + a + b; }`,
      `# \`my-pkg\`

## Exports

### Functions

---

#### \`add\`

\`function\`

**Signatures**

\`(a: number, b: number): string\``,
    );
  });

  it('function with overloaded signatures', async () => {
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

**Signatures**

\`(a: number, b: number): number\`

\`(a: string, b: string): string\``,
    );
  });

  it('union type with core types', async () => {
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
  });

  it('exported interface', async () => {
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
  });

  it('type alias', async () => {
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
  });
  it('type alias w/ type parameter', async () => {
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
  });

  it('interface w/ type parameter ', async () => {
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
  });

  it('interface w/ type parameter and constraint', async () => {
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
  });

  it('simple class w/ constructor', async () => {
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

**Signatures**

\`(bar: string): SimpleClass\``,
    );
  });

  it('simple class w/ constructor and fields', async () => {
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

**Signatures**

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
  });

  it('class with exported base class', async () => {
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

**Signatures**

\`(): SimpleBase\`

##### foo

> \`\`\`ts
> string
> \`\`\`

---

#### \`SimpleClass\`

\`class\` \`extends\` [\`SimpleBase\`](../class/SimpleBase.md "SimpleBase")

**Signatures**

\`(bar: string): SimpleClass\`

##### foo

> \`\`\`ts
> string
> \`\`\``,
    );
  });

  it('class with non-exported base class', async () => {
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

\`class\` \`extends\` [\`SimpleBase\`](../class/SimpleBase.md "SimpleBase")

**Signatures**

\`(bar: string): SimpleClass\`

##### foo

> \`\`\`ts
> string
> \`\`\``,
    );
  });

  it('simple class w/ constructor - export default', async () => {
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

**Signatures**

\`(bar: string): SimpleClass\`

##### foo

> \`\`\`ts
> string
> \`\`\``,
    );
  });

  it('const symbols should get narrow types of the symbol value', async () => {
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
  });
  it('let symbols should get narrow types of the symbol value', async () => {
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
  });

  it('symbol type checker -> type of symbol (1)', async () => {
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
  });

  it('symbol type checker -> type of symbol (2)', async () => {
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
  });

  it('symbol type checker -> type of symbol (3)', async () => {
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
  });
});
