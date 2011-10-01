var path = require('path');

function Binding(files, options) {
  this.options = options || {};
  this.files = (files instanceof Array) ? files : [files];
  this.init();
  return this;
}

Binding.prototype.init = function () {
  // check if all files exist
  for (var i=0; i<this.files.length; i++) {
    exists = path.existsSync(this.files[i]);
    if (!exists) throw new Error('File doesn\'t exist: ' + this.files[i]);
  }
  
  // set type based on options or first file type
  this.type = this.options.type || path.extname(this.files[0]);
};

module.exports = Binding;