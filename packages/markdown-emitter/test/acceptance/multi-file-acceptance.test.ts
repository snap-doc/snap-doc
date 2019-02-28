import { expect } from 'chai';
import { FixtureFolder } from '@code-to-json/test-helpers';
import { describe, it } from 'mocha';
import { setupAcceptanceTest, AcceptanceTestCase } from './helpers';

async function runAcceptanceTest(
  fixture: FixtureFolder,
  cb: (tc: AcceptanceTestCase) => Promise<void>,
): Promise<void> {
  const tc = await setupAcceptanceTest(fixture, false);
  await cb(tc);

  tc.cleanup();
}

describe('Multi-file acceptance tests', () => {
  it('re-exported class through single module', async () => {
    await runAcceptanceTest(
      {
        'index.ts': `export { default as Foo } from './foo';`,
        'foo.ts': `class Foo {
  bar: string = 'baz';
}

export default Foo;`,
      },
      async tc => {
        expect(tc.contentFor('modules/index.ts.md')).to.eq(`# \`my-pkg\`

## Exports

### Classes

#### [\`Foo\`](../class/Foo.md "Foo")

re-export of symbol [\`Foo\`](../class/Foo.md "Foo") from [\`my-pkg/foo\`](foo.ts.md "my-pkg/foo")`);
        expect(tc.contentFor('modules/foo.ts.md')).to.eq(`# \`my-pkg/foo\`

## Exports

### Classes

---

#### [\`Foo\`](type/Foo.md "Foo")

\`alias\``);
      },
    );
  });
});
