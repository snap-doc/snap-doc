import { expect } from 'chai';
import { FixtureFolder } from '@code-to-json/test-helpers';
import { describe, it } from 'mocha';
import { setupAcceptanceTest, AcceptanceTestCase } from './helpers';

async function runAcceptanceTest(
  fixture: FixtureFolder,
  fileType: 'md' | 'html',
  cb: (tc: AcceptanceTestCase) => Promise<void>,
): Promise<void> {
  const tc = await setupAcceptanceTest(fixture, false, fileType);
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
      'md',
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
  it('markdown generation', async () => {
    await runAcceptanceTest(
      {
        'index.ts': `export { default as Foo } from './foo';`,
        'foo.ts': `class Foo {
  bar: string = 'baz';
}

export default Foo;`,
      },
      'md',
      async tc => {
        expect(tc.contentFor('modules/index.ts.md')).to.contain('# `my-pkg`');
        expect(tc.contentFor('modules/foo.ts.md')).to.contain('# `my-pkg/foo`');
      },
    );
  });
  it('html generation', async () => {
    await runAcceptanceTest(
      {
        'index.ts': `export { default as Foo } from './foo';`,
        'foo.ts': `class Foo {
  bar: string = 'baz';
}

export default Foo;`,
      },
      'html',
      async tc => {
        expect(tc.contentFor('modules/index.ts.html')).to.contain(`<h1><code>my-pkg</code></h1>`);
        expect(tc.contentFor('modules/foo.ts.html')).to.contain(`<h1><code>my-pkg/foo</code></h1>`);
      },
    );
  });
});
