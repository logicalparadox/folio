!function (context, definition) {
  if (typeof require === 'function' && typeof exports === 'object' && typeof module === 'object') {
    module.exports = definition(module, exports);
  } else {
    var mod = { exports: {} };
    definition.call(mod.exports, mod, mod.exports);
    if (typeof define === 'function' && typeof define.amd  === 'object') {
      define(function () { return mod.exports; });
    } else {
      if (!context.chai) throw new Error('Chai cannot be found in current scope.');
      context.chai.use(mod.exports);
    }
  }
}(this, function (module, exports) {
