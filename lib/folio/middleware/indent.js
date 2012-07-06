/*!
 * Folio Indentation Middleware
 * Copyright(c) 2012 Jake Luer <jake@alogicalparadox.com>
 * MIT Licensed
 */

/*!
 * Module Requirements
 */

var inherits = require('util').inherits;

/*!
 * Folio Requirements
 */

var Base = require('./base')

/*!
 * Primary Export
 */

module.exports = Indent;

/**
 * ## Indent
 *
 * The indentation middleware will take
 * the incoming source and prepend a given string
 * to every line. Useful for indentation.
 *
 * @header Indent
 */

function Indent () {
  Base.call(this);
  this.name = 'indent';
}

/*!
 * Inherit from Base
 */

inherits(Indent, Base);

/*!
 * Expose the Api
 */

Indent.prototype.handle = function () {
  var self = this
    , api = {};

  /**
   * ### .line (string)
   *
   * Note what to prepend to each line.
   *
   *     // ...
   *     .use(folio.indent())
   *       .line('  ') // two spaces
   *       // ...
   *
   * @param {String} prepend string
   * @returns api for chaning
   * @name line
   * @api public
   */

  api.line = function (str) {
    self.attrs.indent = str;
    return this;
  }

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
 * Take the given `line` string and apply
 * it to each line of the incoming string.
 *
 * @param {String} string of incoming source
 * @param {Object} logger
 * @param {Function} callback
 * @cb Error or null
 * @cb transformed string
 * @name compile
 * @api public
 */

Indent.prototype.compile = function (str, log, cb) {
  var self = this

  if (self.attrs.indent) {
    str = str
      .split('\n')
      .map(function (line) {
        return line.length
          ? self.attrs.indent + line
          : line;
      })
      .join('\n');
  }

  cb(null, str);
};
