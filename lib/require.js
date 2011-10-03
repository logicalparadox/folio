var fs = require('fs'),
    path = require('path'),
    EventEmitter = require('events').EventEmitter,
    util = require('util'),
    detective = require('detective'),
    resolve = require('resolve');

/**
 * Set up wrappers
 */
var wrappers = {},
    wrapfiles = fs.readdirSync(path.join(__dirname, '..', 'wrappers'));

wrapfiles.forEach(function(file) {
  var src = fs.readFileSync(path.join(__dirname, '..', 'wrappers', file), 'utf-8');
  wrappers[file] = src;
});


module.exports = Require;

/**
 * Main export
 */
function Require (module) {
  if (!(this instanceof Require)) return new Require(module);

  try {
    var req = require(module);
  } catch (err) {
    throw new Error(err.message);
  }
  
  this.out = [];
  this.module = module;
  this.require(this.module);
}

util.inherits(Require.prototype, EventEmitter);

Require.prototype.initialize = function () {
  
};

/**
 * Recursive function for loading required files.
 */
Require.prototype.require = function (module, opts) {
  var self = this;
  
  opts = opts || {};
  var file = resolve.sync(module, opts);
  var dir = path.dirname(file);
  var src = fs.readFileSync(file, 'utf-8');
  var reqs = detective.find(src);
  
  reqs.strings.forEach(function(req) {
    self.require(req, {
      basedir: dir
    });
  });
  
  this.out.push({
    module: module,
    path: dir,
    body: src
  });
};


Require.prototype.wrap = function (module, dirname, body) {
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
 * Serve function
 */
Require.prototype.serve = function () {
  var self = this,
      src = '';
  
  this.out.forEach(function(module) {
    src = src + self.wrap(module.module, module.path, module.body);
  });
  
  return src;
};