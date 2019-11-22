/**
 * function: targets
 * author  : wq
 * update  : 2019/10/18 11:25
 */
import Webpack from 'webpack'
import FunctionModulePlugin from 'webpack/lib/FunctionModulePlugin';
import NodeSourcePlugin from 'webpack/lib/node/NodeSourcePlugin';

export const createTarget = function createTarget(name) {
  const miniProgramTarget = compiler => {
    const { options } = compiler
    compiler.apply(
      new Webpack.web.JsonpTemplatePlugin(options.output),
      new FunctionModulePlugin(options.output),
      new NodeSourcePlugin(options.node),
      new Webpack.LoaderTargetPlugin('web')
    )
  }

  // eslint-disable-next-line no-new-func
  const creater = new Function(
    `var t = arguments[0]; return function ${name}(c) { return t(c); }`
  )
  return creater(miniProgramTarget)
}

// 利用Function.name 的特点将target放入Webpack的target的方面名里面，方便loader知道运行的的Target
export const Targets =  {
  Wechat: {
    name: 'Wechat',
    target: createTarget('Wechat'),
    global: 'wx',
    xmlName: 'wxml',
    cssName: 'wxss',
    xjsName: 'wxs',
    xjsTag: 'wxs',
    xmlAttr: 'wx:',
    xmlEvent: 'bind',
    xmlEventPrevent: 'catch'
  },
  Alipay: {
    name: 'Alipay',
    target: createTarget('Alipay'),
    global: 'my',
    xmlName: 'axml',
    cssName: 'acss',
    xjsName: 'sjs',
    xjsTag: 'import-sjs',
    xmlAttr: 'a:',
    xmlEvent: 'on',
    xmlEventPrevent: 'catch'
  },
  DingTalk: {
    name: 'DingTalk',
    target: createTarget('DingTalk'),
    global: 'dd',
    xmlName: 'axml',
    cssName: 'acss',
    xjsName: 'sjs',
    xjsTag: 'import-sjs',
    xmlAttr: 'a:',
    xmlEvent: 'on',
    xmlEventPrevent: 'catch'
  }
}
