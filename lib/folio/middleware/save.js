/*!
 * Folio Minification Middleware
 * Copyright(c) 2012 Jake Luer <jake@alogicalparadox.com>
 * MIT Licensed
 */

/*!
 * Module Requirements
 */

var fs = require('fsagent')
  , path = require('path')
  , inherits = require('util').inherits;

/*!
 * Folio Requirements
 */

var Base = require('./base')

/*!
 * Primary Export
 */

module.exports = Save;

/**
 * ## Save
 *
 * Save the incoming source to a file. Pass
 * the source unmodified to the next
 * chain.
 *
 * @header Save
 */

function Save () {
  Base.call(this);
  this.name = 'save';
}

/*!
 * Inherit from Base
 */

inherits(Save, Base);

/*!
 * Expose the Api
 */

Save.prototype.handle = function () {
  var self = this
    , api = {};

  /**
   * ### .file (name)
   *
   * Specify the file name relative to the
   * Glossary root.
   *
   * @param {String} file path/name
   * @returns api for chaining
   * @api public
   */

  api.file = function (str) {
    self.attrs.file = str;
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
 * Save the incoming string and pass it along
 * to the next compile in the stack.
 *
 * @param {String} string of incoming source
 * @param {Object} logger
 * @param {Function} callback
 * @cb Error or null
 * @cb transformed string
 * @name compile
 * @api public
 */

Save.prototype.compile = function (str, log, cb) {
  var self = this
    , file = this.attrs.file
    , root = this.glossary._attrs.root;

  if (!file) {
    return cb(new Error('Save strategy requires a `file` attribute.'));
  }

  // normalize our paths
  if (!fs.isPathAbsolute(file)) {
    file = path.resolve(root, file);
  }

  var dir = path.dirname(file);

  fs.mkdirp(dir, function (err) {
    if (err) return cb(err);
    fs.writeFile(file, str, 'utf8', function (err) {
      if (err) return cb(err);
      log.save(self.attrs.file);
      cb(null, str);
    });
  });
};
