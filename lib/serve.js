
function Serve (binding) {
  return function (req, res, next) {
    binding.compile(function(err, content) {
      res.header('Content-Type', 'text/javascript');
      res.header('Cache-Control', 'max-age=' + binding.cache);
      res.send(content);
    });
  };
}

module.exports = Serve;