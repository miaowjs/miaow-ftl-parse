# miaow-ftl-parse

> Miaow的FTL编译工具, 会将静态文件的相对路径转换成URL

## 效果示例

```
<@static
  js=['bar.js', 'http://www.bar.com/bar.js', 'foo.js']
  css=['foo.css', 'http://www.bar.com/bar.css', 'bar.css'] />

<#include "bar" >

/* 处理后 */
<@static
  js=["http://127.0.0.1/bar.11d2ff9248.js", "http://www.bar.com/bar.js", "http://127.0.0.1/foo.0e12b83112.js"]
  css=["http://127.0.0.1/foo.c23f5e8a9f.css", "http://www.bar.com/bar.css", "http://127.0.0.1/bar.61e5c77752.css"] />

<#include "bower_components/bar/main.ftl" >
```

### 参数说明

#### macroNameList
Type:`Array` Default:`['static']`

宏名称的列表

#### macroArgList
Type:`Array` Default:`['js', 'css']`

宏参数名的列表
