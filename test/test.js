var assert = require('assert');
var fs = require('fs');
var miaow = require('miaow');
var path = require('path');

var parse = require('../index');
describe('miaow-ftl-parse', function () {
  this.timeout(10e3);

  var log;

  before(function (done) {
    miaow.compile({
      cwd: path.resolve(__dirname, './fixtures'),
      output: path.resolve(__dirname, './output'),
      pack: false,
      domain: 'http://www.foo.com',
      module: {
        tasks: [
          {
            test: /\.ftl/,
            plugins: [{
              plugin: parse,
              option: {
                debug: true,
                macroNameList: ['static', 'staticJS', 'staticCSS'],
                macroArgList: ['js', 'css', 'file']
              }
            }]
          }
        ]
      }
    }, function (err) {
      if (err) {
        console.error(err.toString());
        process.exit(1);
      }
      log = JSON.parse(fs.readFileSync(path.resolve(__dirname, './output/miaow.log.json')));
      done();
    });
  });

  it('接口是否存在', function () {
    assert(!!parse);
  });

  it('是否编译成功', function () {
    assert.equal(log.modules['foo.ftl'].hash, '1dd7d6702a7969210505eb7912aaf172');
  });

  it('是否添加依赖', function () {
    var dependencies = log.modules['foo.ftl'].dependencies;

    assert.equal(dependencies.length, 9);
    assert.notEqual(dependencies.indexOf('bower_components/bar/main.ftl'), -1);
  });
});
