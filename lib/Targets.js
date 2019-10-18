/**
 * function: targets
 * author  : wq
 * update  : 2019/10/18 11:25
 */

export const createTarget = function createTarget(name) {
  const miniProgramTarget = compiler => {
    const { options } = compiler
    compiler.apply(
      new JsonpTemplatePlugin(options.output),
      new FunctionModulePlugin(options.output),
      new NodeSourcePlugin(options.node),
      new LoaderTargetPlugin('web')
    )
  }

  // eslint-disable-next-line no-new-func
  const creater = new Function(
    `var t = arguments[0]; return function ${name}(c) { return t(c); }`
  )
  return creater(miniProgramTarget)
}

// 利用Function.name 的特点将target放入Webpack的target的方面名里面，方便loader知道运行的的Target
module.exports =  {
  Wechat: createTarget('Wechat'),
  Alipay: createTarget('Alipay'),
  Baidu: createTarget('Baidu')
}
