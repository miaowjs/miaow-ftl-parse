var async = require('async');

var includeParse = require('./lib/includeParse');
var staticPathParse = require('./lib/staticPathParse');

var pkg = require('./package.json');

module.exports = function(opitons, callback) {
  async.series([
    includeParse.bind(this, opitons),
    staticPathParse.bind(this, opitons)
  ], callback);
};

module.exports.toString = function() {
  return [pkg.name, pkg.version].join('@');
};
