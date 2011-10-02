
function Serve (glossary) {
  return function (req, res, next) {
    glossary.compile(function(err, content) {
      res.header('Content-Type', 'text/javascript');
      res.header('Cache-Control', 'max-age=' + glossary.cache);
      res.send(content);
    });
  };
}

module.exports = Serve;