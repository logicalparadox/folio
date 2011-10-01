var vows = require('vows'),
    assert = require('assert'),
    path = require('path'),
    request = require('request');
    
var express = require('express');

var codex = require('../');

var suite = vows.describe('Codex Serve');

suite.addBatch({
  'express server': {
    topic: function () {
      var server = express.createServer();
      
      var binding = new codex.binding([
          require.resolve('./include/me.js')
        ]);
        
      var binding_min = new codex.binding([
          require.resolve('./include/me.js')
        ], { minify: true });
      
      server.get('/me.js', codex.serve(binding));
      server.get('/me.min.js', codex.serve(binding_min));
      
      server.listen(8003);
      return server;
    },
    'can serve a codex': {
      topic: function (server) {
        request.get('http://localhost:8003/me.js', this.callback);
      },
      'with response 200': function (error, response, body) {
        assert.isNull(error);
        assert.equal(response.statusCode, 200);
      },
      'with headers text/javascript': function (error, response, body) {
        assert.equal(response.headers['content-type'], 'text/javascript');
      },
      'with correct data': function (error, response, body) {
        var result = [
          '',
          'function me(test) {',
          '  return test;',
          '}',
          ''
        ].join('\n');
        assert.equal(body, result);
      }
    },
    'can serve a minified codex': {
      topic: function (server) {
        request.get('http://localhost:8003/me.min.js', this.callback);
      },
      'with response 200': function (error, response, body) {
        assert.isNull(error);
        assert.equal(response.statusCode, 200);
      },
      'with headers text/javascript': function (error, response, body) {
        assert.equal(response.headers['content-type'], 'text/javascript');
      },
      'with correct data': function (error, response, body) {
        var result = 'function me(a){return a}';
        assert.equal(body, result);
      }
    }
  }
});


suite.export(module);