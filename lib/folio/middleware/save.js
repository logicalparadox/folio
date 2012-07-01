var fs = require('fsagent')
  , path = require('path')
  , inherits = require('util').inherits;

var Base = require('./base')

module.exports = Save;

function Save () {
  Base.call(this);
  this.name = 'save';
}

inherits(Save, Base);

Save.prototype.handle = function () {
  var self = this
    , api = {};

  api.file = function (str) {
    self.attrs.file = str;
    return this;
  }

  api.pop = this.pop.bind(this);

  return api;
};

Save.prototype.compile = function (str, log, cb) {
  var self = this
    , file = this.attrs.file
    , root = this.glossary._attrs.root;

  if (!file) {
    return cb(new Error('Save strategy requires a `file` attribute.'));
  }

  // normalize our paths
  if (!fs.isPathAbsolute(file)) {
    file = path.resolve(root, file);
  }

  var dir = path.dirname(file);

  fs.mkdirp(dir, function (err) {
    if (err) return cb(err);
    fs.writeFile(file, str, 'utf8', function (err) {
      if (err) return cb(err);
      log.save(self.attrs.file);
      cb(null, str);
    });
  });
};
