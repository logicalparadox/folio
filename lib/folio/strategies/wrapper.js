var inherits = require('util').inherits;

var Base = require('./base')

module.exports = Wrapper;

function Wrapper () {
  Base.call(this);
}

inherits(Wrapper, Base);

Wrapper.prototype.handle = function () {
  var api = {};
  api.template = function () { return this; };
  api.pop = this.pop.bind(this);
  return api;
};

Wrapper.prototype.compile = function (str, cb) {
  cb(null, str);
};
