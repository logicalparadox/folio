var path = require('path'),
    fs = require('fs'),
    codex = require('./codex');

/**
 * Set up wrappers
 */
var wrappers = {},
    wrapfiles = fs.readdirSync(path.join(__dirname, '..', 'wrappers'));

wrapfiles.forEach(function(file) {
  var src = fs.readFileSync(path.join(__dirname, '..', 'wrappers', file), 'utf-8');
  wrappers[file] = src;
});


var Volume = module.exports = function Volume(includes, opts) {
  this.includes = includes;
  this.modules = {};
  return this;
};

Volume.prototype.render = function() {
  var self = this;
  this.includes.forEach(function(module) {
    var inc = codex.require(module);
    for (var m in inc.modules) {
      self.modules[m] = inc.modules[m];
    }
  });
};


/**
 * Wrap a module in a file using replace
 */
Volume.prototype.wrap = function (module, dirname, body) {
  return wrappers['module.js']
    .replace(/\$__module/g, function() {
      return JSON.stringify(module);
    })
    .replace(/\$__dirname/g, function() {
      return JSON.stringify(dirname);
    })
    .replace(/\$__src/g, function() {
      return body;
    });
};

/**
 * compile prepares code for serving or output
 */
Volume.prototype.compile = function (callback) {
  var self = this,
      source = wrappers['client.js'];
      
  this.render();
  for (var m in this.modules) {
    module = this.modules[m];
    source = source + this.wrap(module.module, module.path, module.body);
  }
  
  callback(null, source);
};