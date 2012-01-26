var should = require('chai').should()
  , path = require('path')
  , request = require('superagent')
  , connect = require('connect');

var folio = require('..');

describe('serve', function () {
  var server = connect();

  var glossary = new folio.Glossary([
      require.resolve('./include/me.js')
  ]);

  var glossary_min = new folio.Glossary([
      require.resolve('./include/me.js')
  ], { minify: true });

  var glossary_nested = new folio.Glossary([
      require.resolve('./include/me.js')
    , new folio.Glossary([
          require.resolve('./include/you.js')
      ], { minify: true })
  ]);

  var glossary_wrapped = new folio.Glossary([
      path.join(__dirname, 'include', 'me.js')
    , new folio.Glossary([
          path.join(__dirname, 'include', 'you.js')
      ], {
          minify: true
        , prefix: 'function prefixinside() {\n'
        , suffix: 'return you(\'inside\');\n}'
      })
  ], {
      prefix: 'function prefix() {\n'
    , suffix: 'return me(\'test\');\n}'
  });

  server.use('/me.js', folio.serve(glossary));
  server.use('/me.min.js', folio.serve(glossary_min));
  server.use('/me.you.js', folio.serve(glossary_nested));
  server.use('/me.wrapped.js', folio.serve(glossary_wrapped));

  before(function (done) {
    server.listen(9897, done);
  });

  after(function () {
    server.close();
  });

  it('should be able to serve a folio', function (done) {
    request
      .get('localhost:9897/me.js')
      .end(function (res) {
        res.should.have.status(200);
        res.should.have.header('content-type', 'text/javascript');
        res.text.should.equal('\nfunction me(test) {\n  return test;\n}\n');
        done();
      });
  });

  it('should be able to serve a minified folio', function (done) {
    request
      .get('localhost:9897/me.min.js')
      .end(function (res) {
        res.should.have.status(200);
        res.should.have.header('content-type', 'text/javascript');
        res.text.should.equal('function me(a){return a}');
        done();
      });
  });

  it('should be able to serve a nested folio', function (done) {
    request
      .get('localhost:9897/me.you.js')
      .end(function (res) {
        res.should.have.status(200);
        res.should.have.header('content-type', 'text/javascript');
        res.text.should.equal('\nfunction me(test) {\n  return test;\n}\nfunction you(a){return a}');
        done();
      });
  });

  it('should be able to serve a nested & wrapped folio', function (done) {
    request
      .get('localhost:9897/me.wrapped.js')
      .end(function (res) {
        res.should.have.status(200);
        res.should.have.header('content-type', 'text/javascript');
        res.text.should.equal('function prefix() {\n\n\nfunction me(test) {\n  return test;\n}\nfunction prefixinside(){function a(a){return a}return a("inside")}\nreturn me(\'test\');\n}');
        done();
      });
  });
});

