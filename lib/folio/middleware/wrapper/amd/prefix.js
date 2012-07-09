!function (name, context, definition) {
  if (typeof require === "function" && typeof exports === "object" && typeof module === "object")
    module.exports = definition(name, context);
  else if (typeof define === 'function' && typeof define.amd  === 'object') define(definition);
  else context[name] = definition(name, context);
}('#{package}', this, function (name, context) {
