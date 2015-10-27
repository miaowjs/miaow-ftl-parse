var async = require('async');
var uniq = require('lodash.uniq');

module.exports = function(options, callback) {
  var context = this;
  var staticDependencies = [];

  var macroNameList = options.macroNameList || ['static'];
  var macroArgList = options.macroArgList || ['js', 'css'];

  // 匹配宏的正则表达式
  var macroReg = new RegExp('<@(?:' + macroNameList.join('|') + ')[^>]+?>', 'gim');

  // 匹配宏参数的正则表达式
  var macroArgReg = new RegExp(
    '(' +
    macroArgList.join('|') +
    ')\\s*=\\s*\\[(?:\\s*(?:[\'\"][^\'\"]+[\'\"])\\s*\\,?\\s*)+\\]', 'gim'
  );

  var macroArgValueReg = /['"]([^\'\"]+)['"]/;
  var macroArgValueRegGlobal = new RegExp(macroArgValueReg.source, 'g');

  var contents = context.contents.toString();

  if (!contents.trim()) {
    return callback();
  }

  // 获取FTL中对应宏调用里面的静态资源路径
  var staticPathList = [];
  (contents.match(macroReg) || []).forEach(function(macro) {
    (macro.match(macroArgReg) || []).map(function(marcoArg) {
      marcoArg.match(macroArgValueRegGlobal).forEach(function(marcoArgValue) {
        staticPathList.push(marcoArgValue.match(macroArgValueReg)[1]);
      });
    });
  });

  if (staticPathList.length === 0) {
    return callback();
  }

  var urlMap = {};
  async.eachSeries(
    staticPathList,
    function(staticPath, callback) {
      if (/^[\w\/\.\_\-]+$/.test(staticPath)) {
        context.resolveModule(staticPath, function(err, relativeModule) {
          if (err) {
            return callback(err);
          }

          staticDependencies.push(relativeModule.src);
          context.addFileDependency(relativeModule.src);

          urlMap[staticPath] = relativeModule.url;
          callback();
        });
      } else {
        urlMap[staticPath] = staticPath;
        callback();
      }
    },

    function(err) {
      if (err) {
        return callback(err);
      }

      contents = contents.replace(macroReg, function(macro) {
        return macro.replace(macroArgReg, function(macroArg, macroArgName) {
          var staticPathList = macroArg.match(macroArgValueRegGlobal);
          var result = macroArg;

          if (staticPathList.length > 0) {
            staticPathList = staticPathList.map(function(staticPath) {
              return staticPath.match(macroArgValueReg)[1];
            });

            staticPathList = staticPathList.map(function(staticPath) {
              return '"' + urlMap[staticPath] + '"';
            });

            result = macroArgName + '=[' + staticPathList.join(', ') + ']';
          }

          return result;
        });
      });

      context.extra.staticDependencies = uniq(staticDependencies);
      context.contents = new Buffer(contents);
      callback();
    }
  );
};
