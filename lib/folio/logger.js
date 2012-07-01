var quantum = require('quantum');

exports.theme = function (logger, event) {
  var color = logger._levels.colors[event.level]
    , lvl = event.level
    , msg = event.msg
    , _ = quantum.utils;

  var chars = {
      'info': '[?]'
    , 'inc': '[+]'
    , 'ign': '[-]'
    , 'search': '[*]'
    , 'expose': '[»]'
    , 'strat': '[⚡]'
    , 'save': '[◆]'
    , 'error': '[!]'
  };

  var res = _.colorize('  ' + chars[lvl] + ' ', color) + msg + '\n';
  return res;
};

exports.levels = {
    levels: {
        info:        0
      , inc:         1
      , ign:         2
      , search:      3
      , strat:       4
      , expose:      5
      , save:        7
      , error:       8
    }

  , colors: {
        info:        'gray'
      , inc:         'blue'
      , ign:         'red'
      , search:      'yellow'
      , strat:       'magenta'
      , expose:      'cyan'
      , save:        'green'
      , error:       'red'
    }
};
