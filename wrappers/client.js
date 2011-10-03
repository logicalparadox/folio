var require = function(module) {
  return require.module[module]();
};

require.module = {};

