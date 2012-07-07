/*!
 * Folio Base Middleware
 * Copyright(c) 2012 Jake Luer <jake@alogicalparadox.com>
 * MIT Licensed
 */

/*!
 * Module Requirements
 */

var inherits = require('util').inherits;

/*!
 * Primary Export
 */

module.exports = Base;

/**
 * Base (constructor)
 *
 * Setup base constructor for all middleware.
 * Contains a settings object and reference
 * to the source glossary.
 *
 * @api private
 */

function Base () {
  this.attrs = {};
  this.glossary = null;
}

/**
 * ### .handle ()
 *
 * Returns the public api chainable functions.
 * Must include `pop` to return to the glossary.
 *
 * @returns api chain
 * @api public
 */

Base.prototype.handle = function () {
  var api = {};
  api.pop = this.pop.bind(this);
  return api;
};

/**
 * ### .compile (str, logger, callback)
 *
 * Each base should implement a `compile`
 * method that can asyncronously handle
 * transforming the incoming string and
 * return the new source further down
 * the chain.
 *
 * @param {String} string of incoming source
 * @param {Object} logger
 * @param {Function} callback
 * @cb Error or null
 * @cb transformed string
 * @name compile
 * @api public
 */

Base.prototype.compile = function (str, log, cb) {
  cb(null, str);
};

/**
 * ### .pop ()
 *
 * Return the glossary for chaining.
 *
 * @name pop
 * @api public
 */

Base.prototype.pop = function () {
  return this.glossary;
};
