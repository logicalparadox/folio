# Folio

Folio is for simple aggregation and serving of client-side javascript libraries. 
Use as a build tool for client-side libraries or aggregrate you client-side JS for 
serving via connect/express..

## Features

### Aggregation

Folio can be used for creating asyncronous builds of your client files.

```js
var path = require('path'),
    fs = require('fs'),
    folio = require('folio');

// normal output
var glossary = new folio.glossary([
  path.join(__dirname, 'assets', 'first.js'),
  path.join(__dirname, 'assets', 'second.js')
], { minify: true });

// build tasks
glossary.compile(function(err, source) {
  fs.writeFileSync('assets.min.js', source);
});
```

### Serve files with Express

The same binding can easily be served using express.

```js
var server = connect();
server.use('/assets.min.js', folio.serve(glossary));
server.listen(8000);
```

### Advanced Usage Scenarios

Folio also has support for custom compiler. For example, the following blip with compile several
jade files for serving. Using jade's runtime, it is not necissary to compile on the client-side.

```js
var jade = require('jade')
  , join = require('path').join;

var templateJs = new folio.Glossary([
  require.resolve('jade/runtime.js'),
  path.join(__dirname, '..', 'views/templates/js/header.js'),
  path.join(__dirname, '..', 'views/templates/form.jade'),
  path.join(__dirname, '..', 'views/templates/item.jade')
], {
  compilers: {
    jade: function (name, source) {
      return 'template[\'' + name + '\'] = ' +
        jade.compile(source, {
          client: true,
          compileDebug: false
        }) + ';';
    }
  }
});
```


## Testing

Tests are writen in the BDD interface of [Mocha](http://visionmedia.github.com/mocha/) using
the `should` assertion interface from [Chai](http://chaijs.com). Running the tests are simple

    make test

## License

(The MIT License)

Copyright (c) 2011 Jake Luer <jake@alogicalparadox.com>

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
