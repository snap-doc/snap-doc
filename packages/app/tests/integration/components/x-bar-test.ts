import { render } from '@ember/test-helpers';
import { setupRenderingTest } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import { module, test } from 'qunit';

module('Integration | Component | x-bar', hooks => {
  setupRenderingTest(hooks);

  test('it renders', async function run(assert): Promise<void> {
    // Set any properties with this.set('myProperty', 'value');
    // Handle any actions with this.set('myAction', function(val) { ... });

    await render(hbs`{{x-bar}}`);

    assert.equal(`${this.element.textContent}`.trim(), '');

    // Template block usage:
    await render(hbs`
      {{#x-bar}}
        template block text
      {{/x-bar}}
    `);

    assert.equal(`${this.element.textContent}`.trim(), 'template block text');
  });
});
