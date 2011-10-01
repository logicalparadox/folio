
function Serve (binding) {
  return function (req, res, next) {
    binding.compile(function(err, content) {
      res.header('Content-Type', 'text/javascript');
      res.send(content);
    });
  };
}

module.exports = Serve;