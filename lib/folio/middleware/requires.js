/*!
 * Folio Indentation Middleware
 * Copyright(c) 2012 Jake Luer <jake@alogicalparadox.com>
 * MIT Licensed
 */

/*!
 * Module Requirements
 */

var breeze = require('breeze')
  , fs = require('fsagent')
  , inherits = require('util').inherits
  , path = require('path')

/*!
 * Folio Requirements
 */

var Base = require('./base')
  , browser = require('./requires/includes/require');

/*!
 * Primary Export
 */

module.exports = Requires;

function Requires () {
  Base.call(this);
  this.name = 'requires';
}

/*!
 * Inherit from Base
 */

inherits(Requires, Base);

/*!
 * Expose the Api
 */

Requires.prototype.handle = function () {
  var self = this
    , api = {}

  // helper function
  function mountable (key) {
    return function (val) {
      self.attrs[key] = val;
      return this;
    }
  }

  /**
   * ### .package (name)
   *
   * Note the main export to expose for this
   * package.
   *
   * @param {String} name
   * @returns api for chaining
   * @name package
   * @api public
   */

  api.package = mountable('package');

  /**
   * ### .dir (name)
   *
   * Set the starting point directory to traverse
   * for required files. If a relative path is given,
   * it was be resolved from glossary root.
   *
   * @param {String} name
   * @returns api for chaining
   * @name dir
   * @api public
   */

  api.dir = mountable('dir');

  /**
   * ### .entry (name)
   *
   * Set the entry point for the module. An alias
   * will be created from this file to the package
   * name.
   *
   * @param {String} name
   * @returns api for chaining
   * @name entry
   * @api public
   */

  api.entry = mountable('entry');

  /**
   * ### .header (toggle)
   *
   * Toggle whether the common JS header should
   * be included in this pass. Defaults
   * to true.
   *
   * @param {Boolean} toggle
   * @returns api for chaining
   * @name header
   * @api public
   */

  api.header = mountable('header');

  /**
   * ### .ignore (file)
   *
   * Add a file to the ignore list. Files are
   * resolved relative to the required `dir`.
   *
   * @param {String} file path
   * @returns api for chaining
   * @name ignore
   * @api public
   */

  api.ignore = function (file) {
    var ignore = self.attrs.ignore || (self.attrs.ignore = []);
    ignore.push(file);
    return this;
  };

  /**
   * ### .replace (from, to)
   *
   * Replace `require` calls from in each
   * file `from` path `to` path.
   *
   * @param {String} from file
   * @param {String} to file
   * @returns api for chaining
   * @name replace
   * @api public
   */

  api.replace = function (from, to) {
    var replace = self.attrs.replace || (self.attrs.replace = []);
    from = from.replace(/\//g, '\\\/');
    replace.push({
        from: new RegExp("require\\('" + from + "'\\)", "g")
      , to: "require('" + to + "')"
    });
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
 * Read in a directory tree of the provided directory.
 * Remove an ignores, replace any require replacements,
 * and wrap in browser commonjs require loader. Include
 * the common js header if needed.
 *
 * @param {String} string of incoming source
 * @param {Object} logger
 * @param {Function} callback
 * @cb Error or null
 * @cb transformed string
 * @name compile
 * @api public
 */

Requires.prototype.compile = function (str, log, cb) {
  var self = this
    , dir = this.attrs.dir
    , root = this.glossary._attrs.root;

  log.search('#{dir}', { dir: dir });

  // normalize our paths
  if (!fs.isPathAbsolute(dir)) {
    dir = path.resolve(root, dir);
  }

  // get recursive file listing
  fs.tree(dir, function (err, res) {
    if (err) return cb(err);

    // make sure file isn't ignore
    function checkIgnore (file) {
      var res = true
        , ignore = self.attrs.ignore || [];

      ignore.forEach(function (ig) {
        var full = !fs.isPathAbsolute(ig)
          ? path.resolve(dir, ig)
          : ig;
        if (~file.indexOf(full)) {
          res = false;
          log.ign('#{file}', {
              file: file.replace(root, '.')
          });
        }
      });

      return res;
    }

    // sort alphabetically
    res.sort();

    // prepare our file names
    res = res
      .filter(function (file) {
        var ext = path.extname(file).toLowerCase()
        if (ext !== '.js') return false;
        return checkIgnore(file);
      })
      .map(function (file) {
        return {
            req: file.replace(dir + '/', '')
          , file: file
        };
      });

    var buf = str;

    // include commonJS require header
    if (self.attrs.header !== false) {
      log.inc('[[ requires header ]](blue)');
      buf += '\n' + browser.require + '\n\n';
      buf += 'require.modules = {};\n\n';
      buf += 'require.resolve = ' + browser.resolve + ';\n\n';
      buf += 'require.register = ' + browser.register + ';\n\n';
      buf += 'require.relative = ' + browser.relative + ';\n\n';
      buf += 'require.alias = ' + browser.alias + ';\n\n';
    }

    // file iterator: load and modify
    function iterator (js, next) {
      log.inc('#{file}', {
          file: js.file.replace(root, '.')
      });

      fs.readFile(js.file, 'utf8', function (err, src) {
        if (err) return next (err);

        // modifications
        src = parseInheritance(src);
        src = parseReplace(src, self.attrs.replace);

        // include in buffer
        buf += '\nrequire.register("' + js.req + '", function(module, exports, require){\n';
        buf += src
          .split('\n')
          .map(function (line) {
            return line.length
              ? '  ' + line
              : line;
          })
          .join('\n');
        buf += '\n}); // module: ' + js.req + '\n';

        // continue
        next();
      });
    }

    // finish off this require
    function finalize (err) {
      if (err) return cb(err);

      // add entry point
      var entry = self.attrs.entry.replace(dir + '/', '')
        , name = self.attrs.package;
      buf += '\nrequire.alias("' + entry + '", "' + name + '");\n';
      log.expose('#{entry} [»](cyan) #{alias}', { entry: entry, alias: name });

      // send back to glossary
      cb(null, buf);
    }

    // run our iterator on each file
    breeze.forEachSeries(res, iterator, finalize);
  });
};

/*!
 * parseInheritance (source)
 *
 * Replace `__proto__` to a cross-browser compatible
 * equivalant.
 *
 * @param {String} source
 * @returns source modified
 * @api private
 */

function parseInheritance (js) {
  return js
    .replace(/^ *(\w+)\.prototype\.__proto__ * = *(\w+)\.prototype *;?/gm, function(_, child, parent){
      return child + '.prototype = new ' + parent + ';\n'
        + child + '.prototype.constructor = '+ child + ';\n';
    });
}

/*!
 * parseReplace (source, replace)
 *
 * Do all the replacements as indicated
 * from the spec.
 *
 * @param {String} source
 * @param {Object} replace spec
 * @api private
 */

function parseReplace (js, replace) {
  function iterator (spec) {
    js = js.replace(spec.from, spec.to);
  }

  replace = replace || [];
  replace.forEach(iterator);
  return js;
}
