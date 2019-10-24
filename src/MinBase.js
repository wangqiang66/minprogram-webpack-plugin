/**
 * function: 获取项目的根路径, 对于小程序是将app.js 当作根路径
 * author  : wq
 * update  : 2019/10/23 17:06
 */
import path from 'path'
import { Targets } from './index'

export function getBasePath(compiler, options) {
  const { options: webpackOptions } = compiler
  const { base } = options

  if (base) {
    return path.posix.resolve(base)
  }

  const { context, entry } = webpackOptions
  const { extensions } = options
  let appPath
  if (!(appPath = getAppByEntry(entry, extensions))) {
    console.warning('entry do not contain app')
    return context
  } else {
    return path.posix.dirname(appPath)
  }
}

export function setWebpackTarget(compiler) {
  // 处理编译的目标， 默认是微信
  const { options } = compiler
  const { target } = options
  if (target !== Targets.Wechat && target !== Targets.Alipay) {
    options.target = Targets.Wechat
  }

  if (!options.node || options.node.global) {
    options.node = options.node || {}
    options.node.global = false
  }
}

// 获取app.json的入口
export function getAppByEntry(entry, extensions) {
  const extRegExpStr = extensions
    .map(ext => ext.replace(/\./, '\\.'))
    .map(ext => `(${ext})`)
    .join('|')
  const appJSRegExp = new RegExp(`\\bapp(${extRegExpStr})?$`)

  if (typeof entry === 'string') {
    return appJSRegExp.test(entry) ? entry : ''
  }

  if (Array.isArray(entry)) {
    const path = entry.find(item => appJSRegExp.test(item))
    return path || ''
  }

  if (typeof entry === 'object') {
    const path = Object.values(entry).find(item => appJSRegExp.test(item))
    return path || ''
  }
  return ''
}

