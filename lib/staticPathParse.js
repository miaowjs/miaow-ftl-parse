var async = require('async');

module.exports = function (option, cb) {
  var macroNameList = option.macroNameList || ['static'];
  var macroArgList = option.macroArgList || ['js', 'css'];
  // 匹配宏的正则表达式
  var macroReg = new RegExp('<@(?:' + macroNameList.join('|') + ')[\\s\\S]*?>', 'gim');
  // 匹配宏参数的正则表达式
  var macroArgReg = new RegExp(
    '(' +
    macroArgList.join('|') +
    ')\\s*=\\s*\\[(?:\\s*(?:[\'\"][^\'\"]+[\'\"])\\s*\\,?\\s*)+\\]', 'gim'
  );
  var macroArgValueReg = /['"]([^\'\"]+)['"]/;
  var macroArgValueRegGlobal = /['"]([^\'\"]+)['"]/g;

  var contents = this.contents.toString();

  // 获取FTL中对应宏调用里面的静态资源路径
  var staticPathList = [];
  (contents.match(macroReg) || []).forEach(function (macro) {
    (macro.match(macroArgReg) || []).map(function (marcoArg) {
      marcoArg.match(macroArgValueRegGlobal).forEach(function (marcoArgValue) {
        staticPathList.push(marcoArgValue.match(macroArgValueReg)[1]);
      });
    });
  });

  if (staticPathList.length === 0) {
    return cb();
  }

  var module = this;
  var urlMap = {};
  async.eachSeries(
    staticPathList,
    function (staticPath, cb) {
      if (/^[\w\/\.\_\-]+$/.test(staticPath)) {
        module.getModule(staticPath, function (err, relativeModule) {
          if (err) {
            return cb(err);
          }

          urlMap[staticPath] = [
            relativeModule.url || relativeModule.destPathWithHash,
            relativeModule.urlWithoutHash || relativeModule.destPath
          ];
          cb();
        });
      } else {
        urlMap[staticPath] = [
          staticPath,
          staticPath
        ];
        cb();
      }
    },
    function (err) {
      if (err) {
        return cb(err);
      }

      contents = contents.replace(macroReg, function (macro) {
        return macro.replace(macroArgReg, function (macroArg, macroArgName) {
          var staticPathList = macroArg.match(macroArgValueRegGlobal);
          var debugPathList;

          if (staticPathList.length > 0) {
            staticPathList = staticPathList.map(function (staticPath) {
              return staticPath.match(macroArgValueReg)[1];
            });

            debugPathList = staticPathList.map(function (staticPath) {
              return '"' + urlMap[staticPath][1] + '"';
            });

            staticPathList = staticPathList.map(function (staticPath) {
              return '"' + urlMap[staticPath][0] + '"';
            });

            var normalMacroArg = macroArgName + '=[' + staticPathList.join(', ') + ']';
            var debugMacroArg = macroArgName + 'Debug=[' + debugPathList.join(', ') + ']';
            return normalMacroArg + ' ' + debugMacroArg;
          } else {
            return macroArg;
          }
        });
      });

      module.contents = new Buffer(contents);
      cb();
    }
  );
};
