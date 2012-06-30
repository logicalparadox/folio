var breeze = require('breeze')
  , Drip = require('drip')
  , fs = require('fsagent')
  , inherits = require('util').inherits
  , path = require('path');

module.exports = Glossary;

function Glossary (name) {
  Drip.call(this, { delimeter: ':' });
  this._attrs = {};
  this._attrs.name = name;
  this._attrs.root = process.cwd();
  this._attrs.min = false;
  this._root
  this._files = {};
  this._stack = [];
}

inherits(Glossary, Drip);

Glossary.prototype.strategy = function (fn) {
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

Glossary.prototype.out= function (dir) {
  if (!fs.isPathAbsolute(dir)) {
    var root = this._attrs.root;
    dir = path.resolve(root, dir);
  }

  this._attrs.out = dir;
  return this;
};

Glossary.prototype.min = function (bln) {
  this._attrs.min = bln
  return this;
};

Glossary.prototype.loglevel = function (level) {
  this._attrs.loglevel = level;
  return this;
};

Glossary.prototype.compile = function (cb) {
  var self = this
    , cache = '';

  function handleErr (err) {
    self.emit('error', err);
    cb(err);
  }

  function build (done) {
    var source = '';
    breeze.forEachSeries(self._stack, function (fn, next) {
      fn.compile(source, function (err, src) {
        if (err) return next(err);
        source = src;
        next();
      });
    }, function (err) {
      if (err) return next(err);
      cache = source;
      done(null, source);
    });
  }

  function min (next) {
    if (!self._files.min) return next();
    var jsp = require("uglify-js").parser
      , pro = require("uglify-js").uglify
      , orig_code = cache
      , source = '';

    var ast = jsp.parse(orig_code);
    ast = pro.ast_mangle(ast);
    ast = pro.ast_squeeze(ast);
    source = pro.gen_code(ast);
    next(null, source);
  }

  function save (err, res) {
    if (err) return handleErr(err);
    var file = path.join(self._attrs.out, self._attrs.name + '.js')
      , min = path.join(self._attrs.out, self._attrs.name + '.min.js')
      , saves = [ saveFile(file, res.build) ];

    if (self._attrs.min && res.min) {
      saves.push(saveFile(min, res.min));
    }

    breeze.series(saves, function (err) {
      if (err) return handleErr(err);
      cb(null);
    });
  }

  breeze.series({
      build: build
    , min: min
  }, save);
};

function saveFile (file, src) {
  return function (done) {
    var dir = path.dirname(file);
    fs.mkdirp(dir, function (err) {
      if (err) return done(err);
      fs.writeFile(file, src, 'utf8', done);
    });
  }
}
