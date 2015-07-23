var async = require('async');
var mutil = require('miaow-util');

var debugParse = require('./lib/debugParse');
var includeParse = require('./lib/includeParse');
var staticPathParse = require('./lib/staticPathParse');

var pkg = require('./package.json');

module.exports = mutil.plugin(pkg.name, pkg.version, function (option, cb) {
  async.series([
    debugParse.bind(this, option),
    includeParse.bind(this, option),
    staticPathParse.bind(this, option)
  ], cb);
});
