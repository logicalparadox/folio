
function Serve (folio) {
  return function (req, res, next) {
    folio.compile(function(err, content) {
      res.setHeader('Content-Type', 'text/javascript');
      res.setHeader('Cache-Control', 'max-age=' + (folio.cache || 0));
      res.write(content);
    });
  };
}

module.exports = Serve;