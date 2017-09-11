const BroccoliTestHelper = require('broccoli-test-helper');
const createTempDir = BroccoliTestHelper.createTempDir;
const co = require('co');
const fs = require('fs');
const path = require('path');
const stripIndent = require('common-tags').stripIndent;

const CSSInjector = require('../../lib/css_injector.js');

const test = QUnit.test;

QUnit.module('CSSReader', function(hooks) {
  let input;

  hooks.beforeEach(co.wrap(function* () {
    input = yield createTempDir();
  }));

  hooks.afterEach(co.wrap(function* () {
    yield input.dispose();
  }));

  test('does something', function(assert) {
    let fixture = {
      'assets': {
        'vendor.css': 'a { background-color: blue; }',
        'app.css': 'h1 { background-color: green; }'
      },
      'index.html': stripIndent`
        foo-placeholder-regex
        bar-vendorPlaceholder-regex
      `
    };
    input.write(fixture);

    let appCss = fs.readFileSync(path.join(input.path(), 'assets', 'app.css'));
    let vendorCss = fs.readFileSync(path.join(input.path(), 'assets', 'vendor.css'));

    let injector = new CSSInjector({
      template: `${fs.readFileSync(path.join(input.path(), 'index.html'))}`,
      css: `${vendorCss}${appCss}`,
      placeholder: new RegExp('foo-placeholder-regex'),
      vendorPlaceholder: new RegExp('bar-vendorPlaceholder-regex')
    });

    injector.write(path.join(input.path(), 'index.html'));

    let output = fs.readFileSync(path.join(input.path(), 'index.html'), 'utf-8');
    assert.equal(output, `<style>a { background-color: blue; }h1 { background-color: green; }</style>\n`);
  });
});
