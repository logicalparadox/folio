var breeze = require('breeze')
  , fs = require('fsagent')
  , inherits = require('util').inherits
  , path = require('path');

var Base = require('./base')

module.exports = Wrapper;

function Wrapper () {
  Base.call(this);
  this.name = 'wrapper';
}

inherits(Wrapper, Base);

Wrapper.prototype.handle = function () {
  var self = this
    , api = {};

  api.template = function (template) {
    self.attrs.template = template;
    return this;
  };

  api.prefix = function (str) {
    self.attrs.prefix = str;
    return this;
  };

  api.suffix = function (str) {
    self.attrs.suffix = str;
    return this;
  };

  api.package = function (str) {
    self.attrs.package = str;
    return this;
  };

  api.expose = function (str) {
    self.attrs.expose = str;
    return this;
  };

  api.pop = this.pop.bind(this);

  return api;
};

Wrapper.prototype.compile = function (str, log, cb) {
  var self = this
    , src = '';

  if (this.attrs.prefix || this.attrs.suffix) {
    if (this.attrs.prefix) {
      log.inc('[[ using prefix ::](blue) custom []](blue)');
      src += this.attrs.prefix;
    }

    src += str;

    if (this.attrs.suffix) {
      log.inc('[[ using suffix ::](blue) custom []](blue)');
      src += this.attrs.suffix;
    }
  } else {
    src = str;
  }

  var templates = [
      'amd'
    , 'chai-exports'
    , 'chai-requires'
  ];

  if (this.attrs.template) {
    var template = this.attrs.template.toLowerCase();

    if (!~templates.indexOf(template)) {
      return cb(new Error('Unknown wrapper template.'));
    }


    var tmplPath = path.join(__dirname, 'wrapper', template);

    breeze.parallel({
        prefix: function (next) {
          var file = path.join(tmplPath, 'prefix.js');
          log.inc('[[ using prefix ::](blue) #{template} []](blue)', { template: template });
          fs.readFile(file, 'utf8', next);
        }
      , suffix: function (next) {
          var file = path.join(tmplPath, 'suffix.js');
          log.inc('[[ using suffix ::](blue) #{template} []](blue)', { template: template });
          fs.readFile(file, 'utf8', next);
        }
    }, function (err, res) {
      if (err) return cb(err);

      try {
        var prefix = templateTags(self.attrs, res.prefix)
          , suffix = templateTags(self.attrs, res.suffix)
      } catch (ex) {
        return cb(ex);
      }

      if (self.attrs.expose && self.attrs.package) {
        log.expose('#{expose} [»](cyan) #{package}', {
            expose: self.attrs.expose
          , package: self.attrs.package
        });
      }

      src = prefix + '\n' + src + '\n' + suffix;
      cb(null, src);
    });
  } else {
    cb(null, src);
  }
};

function templateTags (attrs, src) {
  return src = src
    .replace(/#\{package\}/g, function () {
      if (!attrs.package) {
        throw new Error('Wrapper template [' + attrs.template + '] requires `package` attribute.');
      }

      return attrs.package
    })
    .replace(/#\{expose\}/g, function () {
      if (!attrs.expose) {
        throw new Error('Wrapper template [' + attrs.template + '] requires `expose` attribute.');
      }

      return attrs.expose;
    })
}
