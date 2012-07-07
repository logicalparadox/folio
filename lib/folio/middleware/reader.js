/*!
 * Folio Reader Middleware
 * Copyright(c) 2012 Jake Luer <jake@alogicalparadox.com>
 * MIT Licensed
 */

/*!
 * Module Requirements
 */

var inherits = require('util').inherits
  , fs = require('fsagent')
  , path = require('path');

/*!
 * Folio Requirements
 */

var Base = require('./base')

/*!
 * Primary Export
 */

module.exports = Reader;

function Reader () {
  Base.call(this);
  this.name = 'reader';
}

/*!
 * Inherit from Base
 */

inherits(Reader, Base);

/*!
 * Expose the Api
 */

Reader.prototype.handle = function () {
  var self = this
    , api = {};

  /**
   * ### .file (filename)
   *
   * Provide the filename to read into the
   * source chain. If the file provided is
   * not an absolute path, it will be resolved
   * according the glossary's root directory.
   *
   * @param {String} filename
   * @returns api for chaining
   * @name file
   * @api public
   */

  api.file = function (file) {
    self.attrs.file = file;
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
 * Read the provided file and append it to whatever
 * is provided and the current string.
 *
 * @param {String} string of incoming source
 * @param {Object} logger
 * @param {Function} callback
 * @cb Error or null
 * @cb transformed string
 * @name compile
 * @api public
 */

Reader.prototype.compile = function (str, log, cb) {
  var self = this
    , file = this.attrs.file;

  log.inc('#{file}', { file: file });

  // normalize our file path
  if (!fs.isPathAbsolute(file)) {
    var root = this.glossary._attrs.root;
    file = path.resolve(root, file);
  }

  fs.readFile(file, 'utf8', function (err, src) {
    if (err) return cb(err);
    cb(null, str + '\n' + src);
  });
};
