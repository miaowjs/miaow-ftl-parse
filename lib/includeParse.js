var async = require('async');
var mutil = require('miaow-util');

module.exports = function(options, callback) {
  var context = this;

  var reg = /<#include\s+['"]([\w\_\/\.\-]+)['"]\s*\/?\s*>/;
  var regGlobal = new RegExp(reg.source, 'g');

  var contents = context.contents.toString();

  if (!contents.trim()) {
    return callback();
  }

  var includePathList = [];
  (contents.match(regGlobal) || []).forEach(function(include) {
    includePathList.push(include.match(reg)[1]);
  });

  var relativePathMap = {};
  async.eachSeries(
    includePathList,
    function(includePath, callback) {
      context.resolveModule(includePath, function(err, includeModule) {
        if (err) {
          return callback(err);
        }

        relativePathMap[includePath] = mutil.relative(
          context.destDir,
          includeModule.dest
        );
        callback();
      });
    },

    function(err) {
      if (err) {
        return callback(err);
      }

      contents = contents.replace(regGlobal, function(str, includePath) {
        return str.replace(includePath, relativePathMap[includePath]);
      });

      context.contents = new Buffer(contents);
      callback();
    }
  );
};
