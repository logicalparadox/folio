var inherits = require('util').inherits
  , fs = require('fsagent')
  , path = require('path');

var Base = require('./base')

module.exports = Reader;

function Reader () {
  Base.call(this);
  this.name = 'reader';
}

inherits(Reader, Base);

Reader.prototype.handle = function () {
  var self = this
    , api = {};

  api.file = function (file) {
    self.attrs.file = file;
    return this;
  };

  api.pop = this.pop.bind(this);

  return api;
};

Reader.prototype.compile = function (str, log, cb) {
  var self = this
    , file = this.attrs.file;

  log.inc('#{file}', { file: file });

  // normalize our file path
  if (!fs.isPathAbsolute(file)) {
    var root = this.glossary._attrs.root;
    file = path.resolve(root, file);
  }

  fs.readFile(file, 'utf8', function (err, src) {
    if (err) return cb(err);
    cb(null, str + '\n' + src);
  });
};
