var async = require('async');

var debugParse = require('./lib/debugParse');
var includeParse = require('./lib/includeParse');
var staticPathParse = require('./lib/staticPathParse');

module.exports = function (option, cb) {
  async.series([
    debugParse.bind(this, option),
    includeParse.bind(this, option),
    staticPathParse.bind(this, option)
  ], cb);
};
