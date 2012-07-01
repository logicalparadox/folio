var inherits = require('util').inherits;

var Base = require('./base')

module.exports = Indent;

function Indent () {
  Base.call(this);
  this.name = 'indent';
}

inherits(Indent, Base);

Indent.prototype.handle = function () {
  var self = this
    , api = {};

  api.line = function (str) {
    self.attrs.indent = str;
    return this;
  }

  api.pop = this.pop.bind(this);

  return api;
};

Indent.prototype.compile = function (str, log, cb) {
  var self = this

  if (self.attrs.indent) {
    str = str
      .split('\n')
      .map(function (line) {
        return line.length
          ? self.attrs.indent + line
          : line;
      })
      .join('\n');
  }

  cb(null, str);
};
