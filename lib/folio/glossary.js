/*!
 * Folio Asset Generator
 * Copyright(c) 2012 Jake Luer <jake@alogicalparadox.com>
 * MIT Licensed
 */

/*!
 * Module Requirements
 */

var breeze = require('breeze')
  , Drip = require('drip')
  , fs = require('fsagent')
  , inherits = require('util').inherits
  , path = require('path')
  , quantum = require('quantum');

/*!
 * Logger
 */

var logger = require('./logger');

/*!
 * Primary Export
 */

module.exports = Glossary;

/**
 * Glossary
 *
 * Handles build level options and stack.
 *
 * @param {String} unique identifier
 * @name Glossary
 * @api public
 */

function Glossary (name) {
  Drip.call(this, { delimeter: ':' });
  this._attrs = {};
  this._attrs.name = name;
  this._attrs.root = process.cwd();
  this._root
  this._files = {};
  this._stack = [];
}

/*!
 * Inherit from Drip
 */

inherits(Glossary, Drip);

/**
 * # use (handle)
 *
 * Add a handler to the the end of the
 * transfermation stack.
 *
 * @param {Function} handler fuction
 * @api public
 */

Glossary.prototype.use = function (fn) {
  if ('string' === typeof fn) {
    var Meta;
    try { Meta = require('./middleware/' + fn.toLowerCase()); }
    catch (ex) { throw new Error('Folio middleware "' + fn + '" doesn\'t exist.'); }
    fn = new Meta();
  }

  this._stack.push(fn);
  fn.glossary = this;

  if ('function' === typeof fn.handle) {
    return fn.handle();
  } else {
    return this;
  }
};

/**
 * # .root (dir[, dir])
 *
 * Set the root directly to be prepended to
 * all of the stack operations that require a path.
 *
 * @param {String} path root
 * @api public
 */

Glossary.prototype.root = function () {
  this._attrs.root = path.resolve.call(path, arguments);
  return this;
};

/**
 * # .silent (boolean)
 *
 * Toggle the log display.
 *
 * @param {Boolean} toggle
 * @api public
 */

Glossary.prototype.silent = function (level) {
  this._attrs.silent = level;
  return this;
};

/**
 * # .compile (cb)
 *
 * Start the compile cycle for the current stack.
 * Takes an optional callback to be invoked upon
 * completion.
 *
 * @param {Function} callback
 * @cb {Error|null} if error
 * @api public
 */

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
    console.log('');
  }

  log.start();

  // headers
  log.info('[building](gray) ::name');
  log.info('[base dir](gray) #{dir}', { dir: this._attrs.root });

  // should any error occur on callback

  // stack iterator
  function iterator (fn, next) {
    var compile = 'function' === typeof fn.compile ? fn.compile : fn;
    log.strat('[' + (fn.name || 'custom') + '](magenta)');
    compile.call(fn, source, log, function (err, src) {
      if (err) return next(err);
      source = src;
      next();
    });
  }

  // on complete handler
  function done (err) {
    if (err) {
      log.error('[' + err.message + '](red)');
      log.error('[::name](gray) [not ok](red)');
      if (!self._attrs.silent) console.log('');
      self.emit('error', err);
      return cb(err);
    }

    log.info('::name [ok](green)');
    if (!self._attrs.silent) console.log('');
    cb(null);
  }

  var source = '';
  breeze.forEachSeries(self._stack, iterator, done);
};
