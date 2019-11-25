/**
 * function: sjs-loader
 * author  : wq
 * update  : 2019/11/22 9:16
 */
import { Targets } from '../plugin/Targets'

export default class MiniCssLoader {
  constructor(loader, source) {
    this.loader = loader
    this.source = source
    this.callback = loader.async()
    this.context = loader.context
    const target = Targets[loader._compilation.options.target.name]
    if (!target) {
      throw new Error('该loader需要和minprogram-webpack-plugin 一起使用')
    }
    this.target = target
    this.parser()
  }

  parser() {
    let content = this.source
    content = this.transformCssPath(content)
    this.callback(null, content)
  }

  transformCssPath(content) {
    const target = this.target
    const importReg = /(^|\s)(@import)(\s*['"])([\w./]+)(['"]\s*)/mg
    const cssName = Object.keys(Targets).map(item => Targets[item].cssName)
    const cssNameReg = new RegExp(`\\.\(?:${cssName.join('|')}\)$`)
    return content.replace(importReg, (match, a1, a2, a3, a4, a5) => {
      if (cssNameReg.test(a4)) {
        return `${a1}${a2}${a3}${a4.replace(cssNameReg, `.${target.cssName}`)}${a5}`
      } else {
        return `${a1}${a2}${a3}${a4}${a5}`
      }
    })
  }
}
