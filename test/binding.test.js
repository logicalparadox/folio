var vows = require('vows'),
    assert = require('assert'),
    path = require('path');

var codex = require('../');

vows.describe('Codex Binding').addBatch({
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
    }
  },
  'multiple file binding': {
    topic: new(codex.binding)([
      path.join(__dirname, 'include', 'me.js'),
      require.resolve('jq/dist/jquery')
    ]),
    'knows which files to include': function (binding) {
      assert.isArray(binding.files);
      assert.length(binding.files, 2);
      assert.include(binding.files, path.join(__dirname, 'include', 'me.js'));
      assert.include(binding.files, require.resolve('jq/dist/jquery'));
    },
    'knows what type of output': function (binding) {
      assert.isString(binding.type);
      assert.equal(binding.type, '.js');
    }
  }
}).export(module);