var breeze = require('breeze')
  , fs = require('fsagent')
  , inherits = require('util').inherits
  , path = require('path')

var Base = require('./base')
  , browser = require('./requires/includes/require');

module.exports = Requires;

function Requires () {
  Base.call(this);
  this.name = 'requires';
}

inherits(Requires, Base);

Requires.prototype.handle = function () {
  var self = this
    , api = {}

  var apiKeys = [
      'package'
    , 'dir'
    , 'entry'
    , 'header'
  ];

  apiKeys.forEach(function (spec) {
    api[spec] = function (s) {
      self.attrs[spec] = s;
      return this;
    };
  });

  api.ignore = function (file) {
    var ignore = self.attrs.ignore || (self.attrs.ignore = []);
    ignore.push(file);
    return this;
  };

  api.replace = function (from, to) {
    var replace = self.attrs.replace || (self.attrs.replace = []);
    from = from.replace(/\//g, '\\\/');
    replace.push({
        from: new RegExp("require\\('" + from + "'\\)", "g")
      , to: "require('" + to + "')"
    });
    return this;
  };

  api.pop = this.pop.bind(this);

  return api;
};

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


function parseInheritance (js) {
  return js
    .replace(/^ *(\w+)\.prototype\.__proto__ * = *(\w+)\.prototype *;?/gm, function(_, child, parent){
      return child + '.prototype = new ' + parent + ';\n'
        + child + '.prototype.constructor = '+ child + ';\n';
    });
}

function parseReplace (js, replace) {
  function iterator (spec) {
    js = js.replace(spec.from, spec.to);
  }

  replace = replace || [];
  replace.forEach(iterator);
  return js;
}
