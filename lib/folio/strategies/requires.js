var breeze = require('breeze')
  , fs = require('fsagent')
  , inherits = require('util').inherits
  , path = require('path')

var Base = require('./base')
  , browser = require('./requires/browser');

module.exports = Requires;

function Requires () {
  Base.call(this);
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

Requires.prototype.compile = function (str, cb) {
  var self = this
    , dir = this.attrs.dir;

  if (!fs.isPathAbsolute(this.attrs)) {
    var root = this.glossary._attrs.root;
    dir = path.resolve(root, this.attrs.dir);
  }

  fs.tree(dir, function (err, res) {
    if (err) return cb(err);

    function checkIgnore (file) {
      var res = true
        , ignore = self.attrs.ignore || [];

      ignore.forEach(function (ig) {
        var full = !fs.isPathAbsolute(ig)
          ? path.resolve(dir, ig)
          : ig;
        if (~file.indexOf(full)) res = false;
      });

      return res;
    }

    function filterJs (file) {
      var ext = path.extname(file).toLowerCase()
      if (ext !== '.js') return false;
      return checkIgnore(file);
    }

    function mapFiles (file) {
      return {
          req: file.replace(dir + '/', '')
        , file: file
      };
    }

    res = res
      .filter(filterJs)
      .map(mapFiles);

    console.log(res);

    var buf = '';

    if (self.attrs.header !== false) {
      buf += '\n// CommonJS require()\n\n';
      buf += browser.require + '\n\n';
      buf += 'require.modules = {};\n\n';
      buf += 'require.resolve = ' + browser.resolve + ';\n\n';
      buf += 'require.register = ' + browser.register + ';\n\n';
      buf += 'require.relative = ' + browser.relative + ';\n\n';
      buf += 'require.alias = ' + browser.alias + ';\n\n';
    }

    breeze.forEachSeries(res, function (js, next) {
      fs.readFile(js.file, 'utf8', function (err, src) {
        if (err) return next (err);

        src = parseInheritance(src);

        if (Array.isArray(self.attrs.replace)) {
          src = parseReplace(src, self.attrs.replace);
        }

        buf += '\nrequire.register("' + js.req + '", function(module, exports, require){\n';
        buf += src;
        buf += '\n}); // module: ' + js.req + '\n';
        next();
      });
    }, function (err) {
      if (err) return cb(err);
      var entry = self.attrs.entry.replace(dir + '/', '')
        , name = self.attrs.name;
      buf += '\nrequire.alias("' + entry + '", "' + name + '");\n';
      cb(null, buf);
    });

  });
};

function parseInheritance (js) {
  return js
    .replace(/^ *(\w+)\.prototype\.__proto__ * = *(\w+)\.prototype *;?/gm, function(_, child, parent){
      return child + '.prototype = new ' + parent + ';\n'
        + child + '.prototype.constructor = '+ child + ';\n';
    });
}

function parseReplace (js, rep) {
  console.log(rep);
  rep.forEach(function (spec) {
    js = js.replace(spec.from, spec.to);
  });
  return js;
}
