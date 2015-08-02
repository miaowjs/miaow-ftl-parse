# miaow-ftl-parse

> Miaow的FTL编译工具, 会将静态文件的相对路径转换成URL, 并提供用于调试的属性

```
<@static
  js=['bar.js', 'http://www.bar.com/bar.js', 'foo.js']
  css=['foo.css', 'http://www.bar.com/bar.css', 'bar.css'] />

<#include "bar" >

/* 处理后 */
<@static
  js=["http://www.foo.com/bar_11d2ff9248.js", "http://www.bar.com/bar.js", "http://www.foo.com/foo_0e12b83112.js"] 
  jsDebug=["http://www.foo.com/bar.js", "http://www.bar.com/bar.js", "http://www.foo.com/foo.js"]
  css=["http://www.foo.com/foo_c23f5e8a9f.css", "http://www.bar.com/bar.css", "http://www.foo.com/bar_61e5c77752.css"] 
  cssDebug=["http://www.foo.com/foo.css", "http://www.bar.com/bar.css", "http://www.foo.com/bar.css"] />

<#include "bower_components/bar/main.ftl" >
```

## 使用说明

### 安装

```
npm install miaow-ftl-parse --save-dev
```

### 在项目的 miaow.config.js 中添加模块的 tasks 设置

```javascript
//miaow.config.js
module: {
  tasks: [
    {
      test: /\.ftl$/,
      plugins: ['miaow-ftl-parse']
    }
  ]
}
```

### 参数说明

* macroNameList 默认值为`['static']`, 宏名称的列表
* macroArgList 默认值为`['js', 'css']`, 宏参数名的列表
* macroDebug 默认为`true`, 是否生成宏`*Debug`参数
* debug 默认为`undefined`, 是否启用调试模式, 如果启用, 就会在FTL文件顶部添加`<#assign __debug__ = true />`语句
