
function Serve (folio) {
  return function (req, res, next) {
    folio.compile(function(err, content) {
      res.header('Content-Type', 'text/javascript');
      res.header('Cache-Control', 'max-age=' + (folio.cache || 0));
      res.send(content);
    });
  };
}

module.exports = Serve;