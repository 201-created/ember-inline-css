'use strict';

const BroccoliTestHelper = require('broccoli-test-helper');
const buildOutput = BroccoliTestHelper.buildOutput;
const createTempDir = BroccoliTestHelper.createTempDir;
const co = require('co');
const oneLineTrim = require('common-tags').oneLineTrim;
const stripIndent = require('common-tags').stripIndent;

const CSSReader = require('../index.js').CSSReader;

const test = QUnit.test;

QUnit.module('CSSReader', function(hooks) {
  let fixture, input;

  hooks.beforeEach(co.wrap(function* () {
    input = yield createTempDir();

    fixture = {
      'assets': {
        'vendor.css': 'a { background-color: blue; }',
        'app.css': 'h1 { background-color: green; }'
      },
      'index.html': oneLineTrim`
        <link rel="stylesheet" href="/assets/vendor.css">
        <link rel="stylesheet" href="/app.css">
      `
    };
  }));

  hooks.afterEach(co.wrap(function* () {
    yield input.dispose();
  }));


  test('concats vendor.css / app.css into style tag inside index.html', co.wrap(function* (assert) {
    input.write(fixture);
    let inputPath = input.path();

    let subject = new CSSReader([inputPath], {
      appName: 'app'
    });


    let output = yield buildOutput(subject);

    assert.deepEqual(output.read()['index.html'], stripIndent`
      <style>a { background-color: blue; }
      h1 { background-color: green; }</style>
    `)
  }));
});

