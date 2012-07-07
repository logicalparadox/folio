/*!
 * Folio Minification Middleware
 * Copyright(c) 2012 Jake Luer <jake@alogicalparadox.com>
 * MIT Licensed
 */

/*!
 * Module Requirements
 */

var inherits = require('util').inherits
  , uglify = require('uglify-js');

/*!
 * Folio Requirements
 */

var Base = require('./base')

/*!
 * Primary Export
 */

module.exports = Minify;

/**
 * ## Minify
 *
 * Minify the incoming source.
 *
 * @header Minify
 */

function Minify () {
  Base.call(this);
  this.name = 'minify';
  this.attrs.mangle = true;
  this.attrs.squeeze = true;
}

/*!
 * Inherit from Base
 */

inherits(Minify, Base);

/*!
 * Expose the Api
 */

Minify.prototype.handle = function () {
  var self = this
    , api = {};

  /**
   * ### .mangle (boolean)
   *
   * Toggle the mange uglify option. Defaults
   * to true.
   *
   * @param {Boolean} mangle switch
   * @return api for chaining
   * @name mangle
   * @api public
   */

  api.mangle = function (bln) {
    self.attrs.mangle = 'boolean' == typeof bln
      ? bln
      : true;
    return this;
  };

  /**
   * ### .sqeeze (boolean)
   *
   * Toggle the squeeze uglify option. Defaults
   * to true.
   *
   * @param {Boolean} sqeeze switch
   * @return api for chaining
   * @name mangle
   * @api public
   */

  api.squeeze = function (str) {
    self.attrs.sqeeze = 'boolean' == typeof bln
      ? bln
      : true;
    return this;
  };

  /**
   * ### .pop ()
   *
   * Return to the glossary.
   *
   * @returns Glossary
   * @name pop
   * @api public
   */

  api.pop = this.pop.bind(this);

  return api;
};

/*!
 * ### .compile (string, logger, callback)
 *
 * Apply a minification strategy to the incoming
 * string. apply mangle and sqeeze accordingly.
 *
 * @param {String} string of incoming source
 * @param {Object} logger
 * @param {Function} callback
 * @cb Error or null
 * @cb transformed string
 * @name compile
 * @api public
 */

Minify.prototype.compile = function (str, log, cb) {
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
