"use strict";

exports.__esModule = true;
exports.Targets = exports.createTarget = void 0;

var _webpack = _interopRequireDefault(require("webpack"));

var _FunctionModulePlugin = _interopRequireDefault(require("webpack/lib/FunctionModulePlugin"));

var _NodeSourcePlugin = _interopRequireDefault(require("webpack/lib/node/NodeSourcePlugin"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * function: targets
 * author  : wq
 * update  : 2019/10/18 11:25
 */
const createTarget = function createTarget(name) {
  const miniProgramTarget = compiler => {
    const {
      options
    } = compiler;
    compiler.apply(new _webpack.default.web.JsonpTemplatePlugin(options.output), new _FunctionModulePlugin.default(options.output), new _NodeSourcePlugin.default(options.node), new _webpack.default.LoaderTargetPlugin('web'));
  }; // eslint-disable-next-line no-new-func


  const creater = new Function(`var t = arguments[0]; return function ${name}(c) { return t(c); }`);
  return creater(miniProgramTarget);
}; // 利用Function.name 的特点将target放入Webpack的target的方面名里面，方便loader知道运行的的Target


exports.createTarget = createTarget;
const Targets = {
  Wechat: {
    name: 'Wechat',
    target: createTarget('Wechat'),
    global: 'wx',
    xmlName: 'wxml',
    cssName: 'wxss'
  },
  Alipay: {
    name: 'Alipay',
    target: createTarget('Alipay'),
    global: 'my',
    xmlName: 'axml',
    cssName: 'acss'
  },
  DingTalk: {
    name: 'DingTalk',
    target: createTarget('DingTalk'),
    global: 'dd',
    xmlName: 'axml',
    cssName: 'acss'
  }
};
exports.Targets = Targets;