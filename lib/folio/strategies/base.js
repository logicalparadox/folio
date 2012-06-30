var inherits = require('util').inherits;

module.exports = Base;

function Base () {
  this.attrs = {};
  this.glossary = null;
}

Base.prototype.handle = function () {
  return {
    end: this.end.bind(this)
  };
};

Base.prototype.compile = function (cb) {
  cb();
};

Base.prototype.pop = function () {
  return this.glossary;
};
