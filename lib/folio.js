/*!
 * folio - tiny static js build and serving utility
 * Copyright(c) 2011-2012 Jake Luer <jake@alogicalparadox.com>
 * MIT Licensed
 */

exports.version = '0.2.1';

exports.Glossary = require('./glossary');

exports.serve = function (folio) {
  return function (req, res, next) {
    folio.compile(function(err, content) {
      res.setHeader('Content-Type', 'text/javascript');
      res.setHeader('Cache-Control', 'max-age=' + (folio.cache || 0));
      res.write(content);
      res.end();
    });
  };
}
