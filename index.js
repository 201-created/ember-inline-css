/* eslint-env node */
'use strict';

var Plugin = require('broccoli-plugin');
var MergeTrees = require('broccoli-merge-trees');
var CSSInjector = require('./lib/css_injector');
var path = require('path');
var fs = require('fs');

var PLACEHOLDER = new RegExp('<link rel="stylesheet" href=".*app.css">');

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
    template: `${fs.readFileSync(path.join(this.inputPaths[0], 'index.html'))}`,
    css: fs.readFileSync(path.join(this.inputPaths[0], 'app.css')),
    placeholder: PLACEHOLDER
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
      return new MergeTrees([tree, new CSSReader([tree])], {
        overwrite: true
      });
    }
    return tree;
  }
};
