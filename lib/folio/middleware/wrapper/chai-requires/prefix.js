!function (context, definition) {
  if (typeof require === "function" && typeof exports === "object" && typeof module === "object") {
    module.exports = definition();
  } else if (typeof define === 'function' && typeof define.amd  === 'object') {
    define(definition);
  } else {
    if (!context.chai) throw new Error('Chai cannot be found in current scope.');
    context.chai.use(definition());
  }
}(this, function () {
