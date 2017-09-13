/* eslint-env node */
'use strict';

let fs = require('fs');
let path = require('path');
let CSS_PREFIX = '<style>';
let CSS_SUFFIX = '</style>';

function CSSInjector(options) {
  Object.assign(this, options);
}

CSSInjector.prototype = {
  write: function(outputPath) {
    let inputHTML = fs.readFileSync(path.join(this.rootPath, 'index.html'), 'utf-8');

    this.filePathsToInject.forEach((p) => {
      if (inputHTML.indexOf(p) === -1) { return; }

      let regex = new RegExp(`<link rel="stylesheet" href="[^"]*${p}"[^>]*>`)

      inputHTML = inputHTML.replace(regex, () => {
        return this.wrapCSS(fs.readFileSync(path.join(this.rootPath, p), 'utf-8'));
      });
    });

    fs.writeFileSync(outputPath, inputHTML, 'utf-8');
  },

  wrapCSS: function(css) {
    return CSS_PREFIX + css + CSS_SUFFIX;
  }
};

module.exports = CSSInjector;
