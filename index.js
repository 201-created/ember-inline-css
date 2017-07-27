/* eslint-env node */
'use strict';

var Plugin = require('broccoli-plugin');
var MergeTrees = require('broccoli-merge-trees');
var CSSInjector = require('./lib/css_injector');
var path = require('path');
var fs = require('fs');

function CSSReader(inputNodes, options) {
  options = options || {};
  Plugin.call(this, inputNodes, {
    annotation: options.annotation
  });
  this.options = options;
  this._cssFileRegExp = new RegExp(`${this.options.appName}.*\.css`);
  this._stylesheetLinkRegExp = new RegExp(`<link rel="stylesheet" href=".*${this.options.appName}.*\.css">`);
}
CSSReader.prototype = Object.create(Plugin.prototype);
CSSReader.prototype.constructor = CSSReader;

CSSReader.prototype.build = function() {
  let cssPath = fs.readdirSync(this.inputPaths[0]).find(file => file.match(this._cssFileRegExp));
  /* Ember files are in a subdirectory */
  if (!cssPath) {
    let assetCssPath = fs.readdirSync(path.join(this.inputPaths[0], 'assets')).find(file => file.match(this._cssFileRegExp));
    cssPath = `assets/${assetCssPath}`;
  }
  var injector = new CSSInjector({
    template: `${fs.readFileSync(path.join(this.inputPaths[0], 'index.html'))}`,
    css: `${fs.readFileSync(path.join(this.inputPaths[0], cssPath))}`,
    placeholder: this._stylesheetLinkRegExp
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
      let cssReaderTree = new CSSReader([tree], {
        appName: (
          (
            /* Basically detect Ember */
            (this.app.options.outputPaths && this.app.options.outputPaths.app.css.app) ?
            /* This isn't actually right, should use the output path
             * above
             */
            this.app.name :
            'app'
          ) ||
          /* Fallback to app for glimmer */
          'app'
        )
      });
      return new MergeTrees([tree, cssReaderTree], {
        overwrite: true
      });
    }
    return tree;
  }
};
