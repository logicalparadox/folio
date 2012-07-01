var breeze = require('breeze')
  , Drip = require('drip')
  , fs = require('fsagent')
  , inherits = require('util').inherits
  , path = require('path')
  , quantum = require('quantum');

var logger = require('./logger');

module.exports = Glossary;

function Glossary (name) {
  Drip.call(this, { delimeter: ':' });
  this._attrs = {};
  this._attrs.name = name;
  this._attrs.root = process.cwd();
  this._root
  this._files = {};
  this._stack = [];
}

inherits(Glossary, Drip);

Glossary.prototype.use = function (fn) {
  this._stack.push(fn);
  fn.glossary = this;

  if ('function' === typeof fn.handle) {
    return fn.handle();
  } else {
    return this;
  }
};

Glossary.prototype.root = function () {
  this._attrs.root = path.resolve.call(path, arguments);
  return this;
}

Glossary.prototype.silent = function (level) {
  this._attrs.silent = level;
  return this;
};

Glossary.prototype.compile = function (cb) {
  var self = this
    , cache = '';

  cb = cb || function () {};

  // initalize our logger
  var log = quantum(this._attrs.name);
  log.levels(logger.levels);
  log.token('name', this._attrs.name);

  if (!this._attrs.silent) {
    log.use(quantum.console({ theme: logger.theme }));
  }

  log.start();

  // headers
  if (!this._attrs.silent) console.log('');
  log.info('[building](gray) ::name');
  log.info('[base dir](gray) #{dir}', { dir: this._attrs.root });

  function handleErr (err) {
    log.error('[' + err.message + '](red)');
    log.error('[::name](gray) [not ok](red)');
    if (!self._attrs.silent) console.log('');
    self.emit('error', err);
    cb(err);
  }

  var source = '';
  breeze.forEachSeries(self._stack, function (fn, next) {
    log.strat('[' + fn.name + '](magenta)')
    fn.compile(source, log, function (err, src) {
      if (err) return next(err);
      source = src;
      next();
    });
  }, function (err) {
    if (err) return handleErr(err);
    log.info('::name [ok](green)');
    if (!self._attrs.silent) console.log('');
    cb(null);
  });
};
