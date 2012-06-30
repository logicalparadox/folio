var folio = require('..');

folio('require.basic')
  .loglevel('debug')
  .out('./dist')
  .min(true)
  .strategy(folio.requires())
    .package('basic')
    .entry('./require_basic/basic.js')
    .dir('./require_basic')
    .pop()
  .strategy(folio.wrapper())
    .template('amd')
    .pop()
  .compile(function (err) {
    if (err) throw err;
    console.log('All done.');
  });
