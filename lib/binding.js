var path = require('path'),
    fs = require('fs');

function Binding(files, options) {
  this.options = options || {};
  this.wrappers = {};
  this.files = (files instanceof Array) ? files : [files];
  this.init();
  return this;
}

Binding.prototype.init = function () {
  var exists;
  // check if all files exist
  for (var i=0; i<this.files.length; i++) {
    exists = path.existsSync(this.files[i]);
    if (!exists) throw new Error('File doesn\'t exist: ' + this.files[i]);
  }
  
  // set type based on options or first file type
  this.type = this.options.type || path.extname(this.files[0]);
  return this;
};

Binding.prototype.compile = function (callback) {
  var compiled = '',
      source;
  
  for (var i=0; i<this.files.length; i++) {
    source = this._wrap(this.files[i]);
    compiled = compiled + source;
  }
  
  if (this.options.minify === true) {
    var jsp = require("uglify-js").parser;
    var pro = require("uglify-js").uglify;
    
    var orig_code = compiled;
    var ast = jsp.parse(orig_code); // parse code and get the initial AST
    ast = pro.ast_mangle(ast); // get a new AST with mangled names
    ast = pro.ast_squeeze(ast); // get an AST with compression optimizations
    compiled = pro.gen_code(ast); // compressed code here
  }
  
  callback(null, compiled);
};

Binding.prototype._wrap = function (file) {
  var source = fs.readFileSync(file, 'utf-8');
  
  source = '\n' + source + '\n';
  
  return source;
};

module.exports = Binding;