/**
 * Require a module.
 */

exports.require = function require (p) {
  var path = require.resolve(p)
    , mod = require.modules[path];
  if (!mod) throw new Error('failed to require "' + p + '"');
  if (!mod.exports) {
    mod.exports = {};
    mod.call(mod.exports, mod, mod.exports, require.relative(path));
  }
  return mod.exports;
};

/**
 * Resolve module path.
 */

exports.resolve = function (path) {
  var orig = path
    , reg = path + '.js'
    , index = path + '/index.js';
  return require.modules[reg] && reg
    || require.modules[index] && index
    || orig;
};

/**
 * Return relative require().
 */

exports.relative = function (parent) {
  return function(p){
    if ('.' != p.charAt(0)) return require(p);

    var path = parent.split('/')
      , segs = p.split('/');
    path.pop();

    for (var i = 0; i < segs.length; i++) {
      var seg = segs[i];
      if ('..' == seg) path.pop();
      else if ('.' != seg) path.push(seg);
    }

    return require(path.join('/'));
  };
};

/**
 * Register a module.
 */

exports.register = function (path, fn) {
  require.modules[path] = fn;
};

/**
 * Register an alias
 */

exports.alias = function (from, to) {
  var fn = require.modules[from];
  require.modules[to] = fn;
};
