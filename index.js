/* eslint-env node */
'use strict';

var Plugin = require('broccoli-plugin');
var MergeTrees = require('broccoli-merge-trees');
var CSSInjector = require('./lib/css_injector');
var path = require('path');

function CSSReader(inputNodes, options) {
  options = options || {};
  Plugin.call(this, inputNodes, {
    annotation: options.annotation
  });
  this.options = options;
}
CSSReader.prototype = Object.create(Plugin.prototype);
CSSReader.prototype.constructor = CSSReader;

CSSReader.prototype.build = function() {
  var injector = new CSSInjector({
    rootPath: this.inputPaths[0],
    filePathsToInject: this.options.filePathsToInject
  });

  injector.write(path.join(this.outputPath, 'index.html'));
};

module.exports = {
  name: 'inline-css',

  isDevelopingAddon() {
    return false;
  },

  postprocessTree(type, tree) {
    if (type === 'all') {
      let filePathsToInject;
      let filter = this.app.options['ember-inline-css'] && this.app.options['ember-inline-css'].filter

      if (filter) {
        filePathsToInject = filter;
      } else {
        // Need to detect path for glimmer vs Ember.  In Glimmer
        // `this.app.options.outputPaths.app.css` is a string
        if (typeof this.app.options.outputPaths.app.css === 'string') {
          filePathsToInject = [
            this.app.options.outputPaths.app.css
          ];
        } else {
          filePathsToInject = [
            this.app.options.outputPaths.app.css.vendor,
            this.app.options.outputPaths.app.css.app
          ];
        }
      }

      let cssReaderTree = new CSSReader([tree], {
        filePathsToInject
      });

      return new MergeTrees([tree, cssReaderTree], {
        overwrite: true
      });
    }
    return tree;
  },
  CSSReader
};
