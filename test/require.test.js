var vows = require('vows'),
    assert = require('assert'),
    path = require('path'),
    request = require('request');
    
var express = require('express');

var codex = require('../');

var suite = vows.describe('Codex Require');

suite.addBatch({
  'require bad module': {
    topic: function() { return null; },
    'throws an error': function (req) {
      var fn = function() {
        return codex.require('fish'); 
      };
      
      assert.throws(fn, Error); 
    }
  }
});


suite.addBatch({
  'require module': {
    topic: codex.require('seed'),
    'does not throw an error': function (req) {
      var src = req.serve();
      console.log(src);
    }
  }
});

suite.export(module);