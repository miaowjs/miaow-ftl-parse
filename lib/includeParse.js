var async = require('async');
var path = require('path');

module.exports = function (option, cb) {
  var module = this;

  var reg = /<#include\s+['"]([\w\_\/\.\-]+)['"]\s*>/;
  var regGlobal = /<#include\s+['"]([\w\_\/\.\-]+)['"]\s*>/g;
  var contents = this.contents.toString();

  var includePathList = [];
  (contents.match(regGlobal) || []).forEach(function (include) {
    includePathList.push(include.match(reg)[1]);
  });

  var relativePathMap = {};
  async.eachSeries(
    includePathList,
    function (includePath, cb) {
      module.getModule(includePath, function (err, includeModule) {
        if (err) {
          return cb(err);
        }

        // 添加依赖信息
        module.dependencies.push(includeModule.srcPath);

        relativePathMap[includePath] = path.relative(
          path.dirname(module.destAbsPath),
          includeModule.destAbsPath
        ).split(path.sep).join('/');
        cb();
      });
    },
    function (err) {
      if (err) {
        return cb(err);
      }

      contents = contents.replace(regGlobal, function (str, includePath) {
        return str.replace(includePath, relativePathMap[includePath]);
      });

      module.contents = new Buffer(contents);
      cb();
    }
  );
};
