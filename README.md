# ember-inline-css

An [Ember](https://emberjs.com/) and [Glimmer](https://glimmerjs.com/) addon to inline CSS files into HTML.

## Installation

```
ember install ember-inline-css
```

Then restart your Ember server. Your styles will be inlined!

## Usage

This addon will take the application and vendor CSS `<link>` tags in the
application's `index.html` file and replace them with inline `<style>` tags.

No configuration is required, it "Just Works".

### Options

Options are passed to ember-inline-css by adding the following to your
`ember-cli-build.js`:

```js
const EmberApp = require('ember-cli/lib/broccoli/ember-app');

module.exports = function(defaults) {
  let app = new EmberApp(defaults, {
    'ember-inline-css': {
      /* pass options here */
    }
  });

  return app.toTree();
};
```

The following options are available:

|option|description|
|---|---|
|`filter`|Provide an array of CSS files to be inlined. For example: `filter: ['/assets/vendor.css']` would only inline the vendor styles, leaving the application styles untouched.|
