var path = require('path'),
    fs = require('fs'),
    async = require('async');

function Binding(files, options) {
  options = options || {};
  this.minify = options.minify || false;
  this.wrappers = {};
  this.wrappers.prefix = options.prefix || null;
  this.wrappers.suffix = options.suffix || null;
  this.type = options.type || null;
  this.files = (files instanceof Array) ? files : [files];
  this.init();
  return this;
}

Binding.prototype.init = function () {
  var exists, file;
  // check if all files exist
  for (var i=0; i<this.files.length; i++) {
    file = this.files[i];
    if ('string' === typeof file) {
      exists = path.existsSync(file);
      if (!exists) throw new Error('File doesn\'t exist: ' + this.files[i]);
    } else if (file instanceof Binding) {
      //console.log('instance');
    } else {
      throw new Error('Unidentified file: ' + file);
    }
  }
  
  // set type based on options or first file type
  this.type = this.type || path.extname(this.files[0]);
  return this;
};

Binding.prototype.compile = function (callback) {
  var self = this,
      source = [];
  
  var runme = function (file, cb) {
    if ('string' === typeof file) {
      self._compile(file, function(err, data) {
        source.push(data);
        cb(err);
      });
    } else if (file instanceof Binding) {
      file.compile(function(err, data) {
        source.push(data);
        cb(err);
      });
    }
  };
  
  async.forEachSeries(this.files, runme, function (err) {
    callback(null, source.join(''));
  });
};

Binding.prototype._compile = function (file, callback) {
  var self = this;
  
  this._wrap(file, function(err, compiled) {
    if (err) {
      callback(err);
      return;
    }
    
    if (self.minify === true) {
      var jsp = require("uglify-js").parser;
      var pro = require("uglify-js").uglify;
      
      var orig_code = compiled;
      var ast = jsp.parse(orig_code);
      ast = pro.ast_mangle(ast);
      ast = pro.ast_squeeze(ast);
      compiled = pro.gen_code(ast);
    }
    
    callback(null, compiled);
  });
};

Binding.prototype._wrap = function (file, callback) {
  var self = this,
      prefix = this.wrappers.prefix || '',
      suffix = this.wrappers.suffix || '',
      compiled;
  
  fs.readFile(file, 'utf-8', function (err, source) {
    if (err) {
      callback(err);
      return;
    }
    
    compiled = prefix + '\n' + source + '\n' + suffix;
    callback(null, compiled);
  });
};

module.exports = Binding;