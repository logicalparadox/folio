var fs = require('fs')
  , path = require('path');

var Glossary = require('./folio/glossary');

var exports = module.exports = function (name) {
  return new Glossary(name);
};

exports.version = '0.2.1';


/*!
 * For each startegy, provide getter on export that
 * will lazy-load that stategy for used.
 */

fs.readdirSync(path.join(__dirname, 'folio', 'strategies'))
  .forEach(function (filename) {
    if (!/\.js$/.test(filename)) return;
    if (/base\.js$/.test(filename)) return;
    var name = path.basename(filename, '.js');
    exports[name] = function (opts) {
      var Meta = require('./folio/strategies/' + name);
      return new Meta(opts);
    };
  });
