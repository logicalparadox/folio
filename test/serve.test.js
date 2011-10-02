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
      
      var glossary = new codex.glossary([
          require.resolve('./include/me.js')
        ]);
        
      var glossary_min = new codex.glossary([
          require.resolve('./include/me.js')
        ], { minify: true });
        
      var glossary_nested = new codex.glossary([
          require.resolve('./include/me.js'),
          new codex.glossary([
              require.resolve('./include/you.js')
            ], { minify: true })
        ]);
      
      var glossary_wrapped = new(codex.glossary)([
        path.join(__dirname, 'include', 'me.js'),
        new codex.glossary([
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
      
      server.get('/me.js', codex.serve(glossary));
      server.get('/me.min.js', codex.serve(glossary_min));
      server.get('/me.you.js', codex.serve(glossary_nested));
      server.get('/me.wrapped.js', codex.serve(glossary_wrapped));
      
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
    },
    'can serve a nested codex': {
      topic: function (server) {
        request.get('http://localhost:8003/me.you.js', this.callback);
      },
      'with response 200': function (error, response, body) {
        assert.isNull(error);
        assert.equal(response.statusCode, 200);
      },
      'with headers text/javascript': function (error, response, body) {
        assert.equal(response.headers['content-type'], 'text/javascript');
      },
      'with correct data': function (error, response, body) {
        var result = '\nfunction me(test) {\n  return test;\n}\nfunction you(a){return a}';
        assert.equal(body, result);
      }
    },
    'can serve a nested & wrapped codex': {
      topic: function (server) {
        request.get('http://localhost:8003/me.wrapped.js', this.callback);
      },
      'with response 200': function (error, response, body) {
        assert.isNull(error);
        assert.equal(response.statusCode, 200);
      },
      'with headers text/javascript': function (error, response, body) {
        assert.equal(response.headers['content-type'], 'text/javascript');
      },
      'with correct data': function (error, response, body) {
        var result = ['function prefix() {\n\nfunction me(test) {\n  return test;\n}',
          '\nreturn me(\'test\');\n}function prefixinside(){',
          'function a(a){return a}return a("inside")}'];
        
        assert.equal(body, result.join(''));
      }
    }
  }
});


suite.export(module);