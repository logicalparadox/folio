var inherits = require('util').inherits
  , uglify = require('uglify-js');

var Base = require('./base')

module.exports = Save;

function Save () {
  Base.call(this);
  this.name = 'minify';
  this.attrs.mangle = true;
  this.attrs.squeeze = true;
}

inherits(Save, Base);

Save.prototype.handle = function () {
  var self = this
    , api = {};

  api.mangle = function (bln) {
    self.attrs.mangle = 'boolean' == typeof bln
      ? bln
      : true;
    return this;
  };

  api.squeeze = function (str) {
    self.attrs.sqeeze = 'boolean' == typeof bln
      ? bln
      : true;
    return this;
  };

  api.pop = this.pop.bind(this);

  return api;
};

Save.prototype.compile = function (str, log, cb) {
  var jsp = uglify.parser
    , pro = uglify.uglify
    , orig_code = str;

  var ast = jsp.parse(orig_code);

  if (this.attrs.mangle) {
    log.inc('[[](blue) mangle []](blue)');
    ast = pro.ast_mangle(ast);
  }

  if (this.attrs.squeeze) {
    log.inc('[[](blue) squeeze []](blue)');
    ast = pro.ast_squeeze(ast);
  }

  str = pro.gen_code(ast);

  cb(null, str);
};
