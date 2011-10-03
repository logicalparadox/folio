var fs = require('fs'),
    path = require('path'),
    EventEmitter = require('events').EventEmitter,
    util = require('util'),
    detective = require('detective'),
    resolve = require('resolve');


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
  
  this.modules = {};
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
  
  this.modules[module] = {
    module: module,
    path: dir,
    body: src
  };
};