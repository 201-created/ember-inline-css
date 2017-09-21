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

    let generatedCss = [];
    this.filePathsToInject.forEach((filePath) => {
      let pathIndex = filePath.lastIndexOf('/');
      let assetPath = filePath.substr(0, pathIndex);
      let fileName = filePath.substr(pathIndex + 1) || '';
      fileName = fileName.replace('.css', '');
      let rootPath = `${this.rootPath}${assetPath}`;

      /* RegExp to match both fingerprinted and non fingerprinted file names */
      let nameRegex = new RegExp(`(${fileName}.css|${fileName}-\\b[0-9a-f]{5,40}\\b.css)`);
      let matchedFile = '';

      /* Generates a array css files from the output directory.
       * Directory operation is done only once.
       * Later this `generatedCss` array is iterated to match the fileName.
       */
      if (generatedCss.length === 0) {
        fs.readdirSync(rootPath).forEach(file => {
          if (file.indexOf('.css') > 0) {
            generatedCss.push(`${file}`);
            if(nameRegex.test(file)) {
              matchedFile = file;
            }
          }
        });
      }

      /* Iterates the `generatedCss` array to get the matchedFile, when it is empty. */
      if (matchedFile.length === 0) {
        generatedCss.forEach(file => {
          if(nameRegex.test(file)) {
            matchedFile = file;
            return;
          }
        })
      }

      if (inputHTML.indexOf(`${assetPath}/${matchedFile}`) === -1) { return; }

      let regex = new RegExp(`<link[^>]* href="[^"]*${assetPath}/${matchedFile}"[^>]*>`)
      inputHTML = inputHTML.replace(regex, () => {
        return this.wrapCSS(fs.readFileSync(path.join(rootPath, matchedFile), 'utf-8'));
      });
    });

    fs.writeFileSync(outputPath, inputHTML, 'utf-8');
  },

  wrapCSS: function(css) {
    return CSS_PREFIX + css + CSS_SUFFIX;
  }
};

module.exports = CSSInjector;
