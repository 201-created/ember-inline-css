'use strict';

const BroccoliTestHelper = require('broccoli-test-helper');
const buildOutput = BroccoliTestHelper.buildOutput;
const createTempDir = BroccoliTestHelper.createTempDir;
const co = require('co');
const oneLineTrim = require('common-tags').oneLineTrim;
const stripIndent = require('common-tags').stripIndent;

const CSSReader = require('../index.js').CSSReader;

const addon = require('../index.js');

const test = QUnit.test;

QUnit.module('ember-inline-css', function(hooks) {
  let input;

  hooks.beforeEach(co.wrap(function* () {
    input = yield createTempDir();
  }));

  hooks.afterEach(co.wrap(function* () {
    yield input.dispose();
  }));

  test('concats vendor.css / app.css into style tag inside index.html', co.wrap(function* (assert) {
    let fixture = {
      'assets': {
        'vendor.css': 'a { background-color: blue; }',
        'app.css': 'h1 { background-color: green; }'
      },
      'index.html': oneLineTrim`
        <link rel="stylesheet" href="/assets/vendor.css">
        <link rel="stylesheet" href="/assets/app.css">
      `
    };
    input.write(fixture);
    let inputPath = input.path();

    let subject = new CSSReader([inputPath], {
      filePathsToInject: ['assets/vendor.css', 'assets/app.css']
    });

    let output = yield buildOutput(subject);

    assert.deepEqual(output.read()['index.html'], oneLineTrim`
      <style>a { background-color: blue; }</style>
      <style>h1 { background-color: green; }</style>
    `)
  }));

  test('postprocessTree (Ember)', co.wrap(function* (assert) {
    let fixture = {
      'assets': {
        'vendor.css': 'a { background-color: blue; }',
        'app.css': 'h1 { background-color: green; }'
      },
      'index.html': oneLineTrim`
        <link rel="stylesheet" href="/assets/vendor.css">
        <link rel="stylesheet" href="/assets/app.css">
      `
    };
    input.write(fixture);
    let inputPath = input.path();

    // Ember app config reference:
    // https://github.com/ember-cli/ember-cli/blob/f46be84f38a0c790f864d5b982e675c206f59a45/lib/broccoli/ember-app.js#L55
    let instance = Object.assign({}, addon, {
      app: {
        options: {
          outputPaths: {
            app: {
              css: {
                vendor: 'assets/vendor.css',
                app: 'assets/app.css'
              }
            }
          }
        }
      }
    });

    let output = yield buildOutput(instance.postprocessTree('all', inputPath));

    assert.deepEqual(output.read()['index.html'], oneLineTrim`
      <style>a { background-color: blue; }</style>
      <style>h1 { background-color: green; }</style>
    `)
  }));

  test('postprocessTree (Glimmer)', co.wrap(function* (assert) {
    let fixture = {
      'assets': {
        'vendor.css': 'a { background-color: blue; }',
        'app.css': 'h1 { background-color: green; }'
      },
      'index.html': oneLineTrim`
        <link rel="stylesheet" href="/assets/vendor.css">
      `
    };
    input.write(fixture);
    let inputPath = input.path();

    // Glimmer app config reference:
    // https://github.com/glimmerjs/glimmer-application-pipeline/blob/f17479e33f2078e0ef0fc50a5d50539903fe230d/lib/broccoli/glimmer-app.ts#L98
    let instance = Object.assign({}, addon, {
      app: {
        options: {
          outputPaths: {
            app: {
              css: 'assets/vendor.css'
            }
          }
        }
      }
    });

    let output = yield buildOutput(instance.postprocessTree('all', inputPath));

    assert.deepEqual(output.read()['index.html'], oneLineTrim`
      <style>a { background-color: blue; }</style>
    `)
  }));

  test('postprocessTree filter performs injection for specified files', co.wrap(function* (assert) {
    let fixture = {
      'assets': {
        'first.css': 'a { background-color: blue; }',
        'second.css': 'h1 { background-color: green; }'
      },
      'index.html': oneLineTrim`
        <link rel="stylesheet" href="/assets/first.css">
        <link rel="stylesheet" href="/assets/second.css">
      `
    };
    input.write(fixture);
    let inputPath = input.path();

    // Ember app config reference:
    // https://github.com/ember-cli/ember-cli/blob/f46be84f38a0c790f864d5b982e675c206f59a45/lib/broccoli/ember-app.js#L55
    let instance = Object.assign({}, addon, {
      app: {
        options: {
          'ember-inline-css': {
            filter: [
              '/assets/first.css', '/assets/second.css'
            ],
          }
        }
      }
    });

    let output = yield buildOutput(instance.postprocessTree('all', inputPath));

    assert.deepEqual(output.read()['index.html'], oneLineTrim`
      <style>a { background-color: blue; }</style>
      <style>h1 { background-color: green; }</style>
    `)
  }));
});

