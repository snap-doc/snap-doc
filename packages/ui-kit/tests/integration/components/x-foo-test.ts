import { render } from '@ember/test-helpers';
import { setupRenderingTest } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import { module, test } from 'qunit';

module('Integration | Component | x-foo', hooks => {
  setupRenderingTest(hooks);

  // tslint:disable-next-line:typedef
  test('it renders', async function(assert: Assert) {
    // Set any properties with this.set('myProperty', 'value');
    // Handle any actions with this.set('myAction', function(val) { ... });

    await render(hbs`{{x-foo}}`);

    assert.equal(('' + this.element.textContent).trim(), '');

    // Template block usage:
    await render(hbs`
      {{#x-foo}}
        template block text
      {{/x-foo}}
    `);

    assert.equal(('' + this.element.textContent).trim(), 'template block text');
  });
});
