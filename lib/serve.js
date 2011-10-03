
function Serve (codex) {
  return function (req, res, next) {
    codex.compile(function(err, content) {
      res.header('Content-Type', 'text/javascript');
      res.header('Cache-Control', 'max-age=' + (codex.cache || 0));
      res.send(content);
    });
  };
}

module.exports = Serve;