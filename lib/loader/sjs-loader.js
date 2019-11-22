"use strict";

exports.__esModule = true;
exports.default = void 0;

var _Targets = require("../plugin/Targets");

/**
 * function: sjs-loader
 * author  : wq
 * update  : 2019/11/22 9:16
 */
class MiniSjsLoader {
  constructor(loader, source) {
    this.loader = loader;
    this.source = source;
    this.callback = loader.async();
    this.context = loader.context;
    const target = _Targets.Targets[loader._compilation.options.target.name];

    if (!target) {
      throw new Error('该loader需要和minprogram-webpack-plugin 一起使用');
    }

    this.target = target;
    this.parser();
  }

  parser() {
    let content = this.source;
    content = this.transformSjsTag(content);
    this.callback(null, content);
  }

  transformSjsTag(content) {
    const target = this.target;
    const importReg = /(^|\s|,|;|=)(import|require)(\s*\(\s*['"])([\w./@-_]+)(['"]\s*\))/mg;
    const xjsName = Object.keys(_Targets.Targets).map(item => _Targets.Targets[item].xjsName);
    const xjsNameReg = new RegExp(`\\.\(?:${xjsName.join('|')}\)$`);
    return content.replace(importReg, (match, a1, a2, a3, a4, a5) => {
      if (xjsNameReg.test(a4)) {
        return `${a1}${a2}${a3}${a4.replace(xjsNameReg, `.${target.xjsName}`)}${a5}`;
      } else {
        return `${a1}${a2}${a3}${a4}${a5}`;
      }
    });
  }

}

exports.default = MiniSjsLoader;
module.exports = exports["default"];