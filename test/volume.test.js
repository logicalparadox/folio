var vows = require('vows'),
    assert = require('assert'),
    path = require('path'),
    request = require('request');
    
var express = require('express');

var codex = require('../');

var suite = vows.describe('Codex Volume');

suite.addBatch({
  'require module': {
    topic: function() {
        return new codex.volume(['seed', 'async']);
      },
    'does not throw an error': function (req) {
      //console.log(req);
    }
  }
});

suite.export(module);