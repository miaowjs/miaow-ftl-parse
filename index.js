var staticPathParse = require('./lib/staticPathParse');

module.exports = function (option, cb) {
  staticPathParse.call(this, option, cb);
};
