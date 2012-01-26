var path = require('path'),
    fs = require('fs'),
    async = require('async');

var env = process.env.NODE_ENV || 'development';

module.exports = Glossary;

function Glossary (files, options) {
  options = options || {};
  this.minify = options.minify || false;
  this.cache = options.cache || env === 'production' ? 1296000 : 0;
  this.wrappers = {};
  this.wrappers.prefix = options.prefix || null;
  this.wrappers.suffix = options.suffix || null;
  this.compilers = options.compilers || {};
  this.type = options.type || null;
  this.files = (files instanceof Array) ? files : [files];
  this.checkFiles();
  return this;
}

Glossary.prototype.checkFiles = function () {
  var exists, file;
  // check if all files exist
  for (var i=0; i<this.files.length; i++) {
    file = this.files[i];
    if ('string' === typeof file) {
      exists = path.existsSync(file);
      if (!exists) throw new Error('File doesn\'t exist: ' + this.files[i]);
    } else if (file instanceof Glossary) {
      //console.log('instance');
    } else {
      throw new Error('Unidentified file: ' + file);
    }
  }

  // set type based on options or first file type
  this.type = this.type || path.extname(this.files[0]);
  return this;
};

Glossary.prototype.compile = function (callback) {
  var self = this
    , prefix = this.wrappers.prefix
    , suffix = this.wrappers.suffix
    , source = [];

  var runme = function (file, cb) {
    if ('string' === typeof file) {
      self._compile(file, function(err, data) {
        source.push(data);
        cb(err);
      });
    } else if (file instanceof Glossary) {
      file.compile(function(err, data) {
        source.push(data);
        cb(err);
      });
    }
  };

  async.forEachSeries(this.files, runme, function (err) {
    var buf = ''
      , compiled = '';
    if (prefix) buf += prefix + '\n';
    buf += source.join('');
    if (suffix) buf += '\n' + suffix;
    compiled = (self.minify) ? self._minify(buf) : buf;
    callback(null, compiled);
  });
};

Glossary.prototype._minify = function (src) {
  var jsp = require("uglify-js").parser
    , pro = require("uglify-js").uglify
    , compiled = ''
    , orig_code = src;

  var ast = jsp.parse(orig_code);
  ast = pro.ast_mangle(ast);
  ast = pro.ast_squeeze(ast);
  compiled = pro.gen_code(ast);
  return compiled;
};

Glossary.prototype._compile = function (file, callback) {
  var self = this
    , compilers = this.compilers
  fs.readFile(file, 'utf-8', function (err, source) {
    if (err) return callback(err);
    var ext = path.extname(file).toLowerCase().substr(1)
      , filename = path.basename(file, '.' + ext)
      , compiled = (compilers[ext])
          ? '\n' + compilers[ext](filename, source, file) + '\n'
          : '\n' + source + '\n';
    callback(null, compiled);
  });
};
