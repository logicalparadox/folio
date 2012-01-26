var should = require('chai').should()
  , join = require('path').join;

var folio = require('..')
  , Glossary = folio.Glossary;

describe('glossary', function () {

  it('should have a version', function () {
    folio.version.should.match(/^\d+\.\d+\.\d+$/);
  });

  describe('single file binding', function () {

    it('should throw an error if a file doens\'t exist', function () {
      function buildJs () {
        var b = new Glossary(join(__dirname, 'include', 'bad.js'));
        return b;
      }
      (buildJs).should.throw(Error);
    });

    describe('correctly configured', function () {
      var binding = new Glossary(join(__dirname, 'include', 'me.js'));

      it('should understand thy self', function () {
        binding.files.should.be.instanceof(Array);
        binding.files.should.have.length(1);
        binding.files.should.include(join(__dirname, 'include', 'me.js'));
        binding.type.should.be.a('string');
        binding.type.should.equal('.js');
      });

      it('should correctly compile', function (done) {
        binding.compile(function (err, res) {
          should.not.exist(err);
          res.should.be.a('string');
          res.should.equal('\nfunction me(test) {\n  return test;\n}\n');
          done();
        });
      });
    });
  });

  describe('custom compilers', function () {

    it('should correctly compile', function (done) {
      var binding = new Glossary(join(__dirname, 'include', 'hello.md'), {
          compilers: {
              md: function (name, source, file) {
                name.should.equal('hello');
                source.should.equal('# Hello\n\nUniverse\n');
                file.should.equal(join(__dirname, 'include', 'hello.md'));
                return '<h1>Hello</h1><p>Universe<p>';
              }
          }
      });

      binding.compile(function (err, res) {
        should.not.exist(err);
        res.should.be.a('string');
        res.should.equal('\n<h1>Hello</h1><p>Universe<p>\n');
        done();
      });
    });
  });

  describe('multiple file binding', function () {

    it('should throw an error if a file doens\'t exist', function () {
      function buildJs () {
        var b = new Glossary([
            join(__dirname, 'include', 'bad.js')
          , join(__dirname, 'include', 'me.js')
        ]);
        return b;
      }
      (buildJs).should.throw(Error);
    });

    describe('correctly configured', function () {
      var binding = new Glossary([
          join(__dirname, 'include', 'me.js')
        , join(__dirname, 'include', 'you.js')
      ]);

      it('should understand thy self', function () {
        binding.files.should.be.instanceof(Array);
        binding.files.should.have.length(2);
        binding.files.should.include(join(__dirname, 'include', 'me.js'));
        binding.files.should.include(join(__dirname, 'include', 'you.js'));
        binding.type.should.be.a('string');
        binding.type.should.equal('.js');
      });

      it('should correctly compile', function (done) {
        binding.compile(function (err, res) {
          should.not.exist(err);
          res.should.be.a('string');
          res.should.equal('\nfunction me(test) {\n  return test;\n}\n\nfunction you(tester) {\n  return tester;\n}\n');
          done();
        });
      });
    });
  });


  describe('multiple file binding with options', function () {

    it('should throw an error if a file doens\'t exist', function () {
      function buildJs () {
        var b = new Glossary([
            join(__dirname, 'include', 'bad.js')
          , join(__dirname, 'include', 'me.js')
        ], { minify: true });
        return b;
      }
      (buildJs).should.throw(Error);
    });

    describe('correctly configured', function () {
      var binding = new Glossary([
          join(__dirname, 'include', 'me.js')
        , join(__dirname, 'include', 'you.js')
      ], { minify: true });

      it('should understand thy self', function () {
        binding.files.should.be.instanceof(Array);
        binding.files.should.have.length(2);
        binding.files.should.include(join(__dirname, 'include', 'me.js'));
        binding.files.should.include(join(__dirname, 'include', 'you.js'));
        binding.type.should.be.a('string');
        binding.type.should.equal('.js');
      });

      it('should correctly compile', function (done) {
        binding.compile(function (err, res) {
          should.not.exist(err);
          res.should.be.a('string');
          res.should.equal('function me(a){return a}function you(a){return a}');
          done();
        });
      });
    });
  });

  describe('multiple file binding with options', function () {

    it('should throw an error if a file doens\'t exist', function () {
      function buildJs () {
        var b = new Glossary([
            join(__dirname, 'include', 'bad.js')
          , new Glossary(join(__dirname, 'include', 'me.js'))
        ], { minify: true });
        return b;
      }
      (buildJs).should.throw(Error);
    });

    describe('correctly configured', function () {
      var binding = new Glossary([
          join(__dirname, 'include', 'me.js')
        , new Glossary(join(__dirname, 'include', 'you.js'), { minify: true })
      ]);

      it('should understand thy self', function () {
        binding.files.should.be.instanceof(Array);
        binding.files.should.have.length(2);
        binding.files.should.include(join(__dirname, 'include', 'me.js'));
        binding.type.should.be.a('string');
        binding.type.should.equal('.js');
      });

      it('should correctly compile', function (done) {
        binding.compile(function (err, res) {
          should.not.exist(err);
          res.should.be.a('string');
          res.should.equal('\nfunction me(test) {\n  return test;\n}\nfunction you(a){return a}');
          done();
        });
      });
    });
  });

  describe('multiple file binding with wrappers', function () {

    it('should throw an error if a file doens\'t exist', function () {
      function buildJs () {
        var b = new Glossary([
            join(__dirname, 'include', 'bad.js')
          , new Glossary(join(__dirname, 'include', 'me.js'))
        ], { minify: true });
        return b;
      }
      (buildJs).should.throw(Error);
    });

    describe('correctly configured', function () {

      var binding = new Glossary([
          join(__dirname, 'include', 'me.js')
        , new Glossary(join(__dirname, 'include', 'you.js'), {
              minify: true
            , prefix: 'function prefixinside() {\n'
            , suffix: 'return you(\'inside\');\n}'
          })
        ], {
            prefix: 'function prefix() {'
          , suffix: 'return me(\'test\');\n}'
      });

      it('should understand thy self', function () {
        binding.files.should.be.instanceof(Array);
        binding.files.should.have.length(2);
        binding.files.should.include(join(__dirname, 'include', 'me.js'));
        binding.type.should.be.a('string');
        binding.type.should.equal('.js');
      });

      it('should correctly compile', function (done) {
        binding.compile(function (err, res) {
          should.not.exist(err);
          res.should.be.a('string');
          res.should.equal('function prefix() {\n\nfunction me(test) {\n  return test;\n}\nfunction prefixinside(){function a(a){return a}return a("inside")}\nreturn me(\'test\');\n}');
          done();
        });
      });
    });
  });
});

