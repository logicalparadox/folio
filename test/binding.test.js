var vows = require('vows'),
    assert = require('assert'),
    path = require('path');

var codex = require('../');

var suite = vows.describe('Codex Binding');

suite.addBatch({
  'single file binding': {
    topic: new(codex.binding)( path.join(__dirname, 'include', 'me.js') ),
    'knows which files to include': function (binding) {
      assert.isArray(binding.files);
      assert.length(binding.files, 1);
      assert.include(binding.files, path.join(__dirname, 'include', 'me.js'));
    },
    'knows what type of output': function (binding) {
      assert.isString(binding.type);
      assert.equal(binding.type, '.js');
    },
    'throws error if file doesn\'t exist': function (binding) {
      assert.throws(function() {
        var b = new(codex.binding)(path.join(__dirname, 'include', 'bad.js'));
        return b;
      }, Error);
    },
    'can be compiled': {
      topic: function (binding) {
        binding.compile(this.callback);
      },
      'without error': function (error, success) {
        assert.isNull(error);
        assert.isNotNull(success);
        assert.isString(success);
      },
      'with correct data': function (error, success) {
        var result = [
          '',
          'function me(test) {',
          '  return test;',
          '}',
          ''
        ].join('\n');
        
        assert.equal(success, result);
      }
    }
  }
});

suite.addBatch({
  'multiple file binding': {
    topic: new(codex.binding)([
      path.join(__dirname, 'include', 'me.js'),
      path.join(__dirname, 'include', 'you.js')
    ]),
    'knows which files to include': function (binding) {
      assert.isArray(binding.files);
      assert.length(binding.files, 2);
      assert.include(binding.files, path.join(__dirname, 'include', 'me.js'));
      assert.include(binding.files, path.join(__dirname, 'include', 'you.js'));
    },
    'knows what type of output': function (binding) {
      assert.isString(binding.type);
      assert.equal(binding.type, '.js');
    },
    'throws error if file doesn\'t exist': function (binding) {
      assert.throws(function() {
        var b = new(codex.binding)([
          path.join(__dirname, 'include', 'bad.js'),
          require.resolve('jq/dist/jquery')
        ]);
        return b;
      }, Error);
    },
    'can be compiled': {
      topic: function (binding) {
        binding.compile(this.callback);
      },
      'without error': function (error, success) {
        assert.isNull(error);
        assert.isNotNull(success);
        assert.isString(success);
      },
      'with correct data': function (error, success) {
        var result = [
          '',
          'function me(test) {',
          '  return test;',
          '}',
          '',
          'function you(tester) {',
          '  return tester;',
          '}',
          ''
        ].join('\n');
        
        assert.equal(success, result);
      }
    }
  }  
});

suite.addBatch({
  'multiple file binding with options': {
    topic: new(codex.binding)([
      path.join(__dirname, 'include', 'me.js'),
      path.join(__dirname, 'include', 'you.js')
    ], { minify: true }),
    'knows which files to include': function (binding) {
      assert.isArray(binding.files);
      assert.length(binding.files, 2);
      assert.include(binding.files, path.join(__dirname, 'include', 'me.js'));
      assert.include(binding.files, path.join(__dirname, 'include', 'you.js'));
    },
    'knows what type of output': function (binding) {
      assert.isString(binding.type);
      assert.equal(binding.type, '.js');
    },
    'throws error if file doesn\'t exist': function (binding) {
      assert.throws(function() {
        var b = new(codex.binding)([
          path.join(__dirname, 'include', 'bad.js'),
          require.resolve('jq/dist/jquery')
        ]);
        return b;
      }, Error);
    },
    'can be compiled': {
      topic: function (binding) {
        binding.compile(this.callback);
      },
      'without error': function (error, success) {
        assert.isNull(error);
        assert.isNotNull(success);
        assert.isString(success);
      },
      'with minified data': function (error, success) {
        var result = 'function me(a){return a}function you(a){return a}';
        
        assert.equal(success, result);
      }
    }
  }  
});

suite.addBatch({
  'nested file bindings': {
    topic: new(codex.binding)([
      path.join(__dirname, 'include', 'me.js'),
      new codex.binding([
        path.join(__dirname, 'include', 'you.js')
      ], { minify: true })
    ]),
    'knows which files to include': function (binding) {
      assert.isArray(binding.files);
      assert.length(binding.files, 2);
    },
    'knows what type of output': function (binding) {
      assert.isString(binding.type);
      assert.equal(binding.type, '.js');
    },
    'throws error if file doesn\'t exist': function (binding) {
      assert.throws(function() {
        var b = new(codex.binding)([
          path.join(__dirname, 'include', 'me.js'),
          new codex.binding([
            path.join(__dirname, 'include', 'bad.js')
          ])
        ]);
        return b;
      }, Error);
    },
    'can be compiled': {
      topic: function (binding) {
        binding.compile(this.callback);
      },
      'without error': function (error, success) {
        assert.isNull(error);
        assert.isNotNull(success);
        assert.isString(success);
      },
      'with nested only minified data': function (error, success) {
        var result = '\nfunction me(test) {\n  return test;\n}\nfunction you(a){return a}';
        
        assert.equal(success, result);
      }
    }
  }
});

suite.addBatch({
  'multiple file binding wrappers': {
    topic: function() {
      
      return new(codex.binding)([
        path.join(__dirname, 'include', 'me.js'),
        new codex.binding([
          path.join(__dirname, 'include', 'you.js')
        ], { 
          minify: true, 
          prefix: 'function prefixinside() {\n',
          suffix: 'return you(\'inside\');\n}'
        })
      ], {
        prefix: 'function prefix() {\n',
        suffix: 'return me(\'test\');\n}'
      });
    },
    'knows which files to include': function (binding) {
      assert.isArray(binding.files);
      assert.length(binding.files, 2);
    },
    'knows what type of output': function (binding) {
      assert.isString(binding.type);
      assert.equal(binding.type, '.js');
    },
    'can be compiled': {
      topic: function (binding) {
        binding.compile(this.callback);
      },
      'without error': function (error, success) {
        assert.isNull(error);
        assert.isNotNull(success);
        assert.isString(success);
      },
      'with wrapped data and nested minified': function (error, success) {
        var result = ['function prefix() {\n\nfunction me(test) {\n  return test;\n}',
          '\nreturn me(\'test\');\n}function prefixinside(){',
          'function a(a){return a}return a("inside")}'];
        
        assert.equal(success, result.join(''));
      }
    }
  }
});

suite.export(module);