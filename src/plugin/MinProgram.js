/**
 * function: 处理小程序的入口
 * author  : wq
 * update  : 2019/10/23 17:45
 */
import path, { parse, resolve } from 'path'
import { readJson, readFileSync } from 'fs-extra'
import { getBasePath, setWebpackTarget } from './MinBase'
import { values } from 'lodash'
import MinOptions from './MinOptions'
import { Targets } from './index'
import sax from 'sax'

const AbsolutePathExp = /^\//
const NotNodeNodulesExp = /^[./]/
const ROOT_TAG_NAME = 'xxx-wxml-root-xxx'
const ROOT_TAG_START = `<${ROOT_TAG_NAME}>`
const ROOT_TAG_END = `</${ROOT_TAG_NAME}>`

export default class MinProgram {
  constructor(options) {
    this.options = new MinOptions().process(options)
    this.base = ''
  }

  initOptions(compiler) {
    setWebpackTarget(compiler)
    this.setBase(compiler)
  }

  setBase(compiler) {
    this.base = getBasePath(compiler, this.options)
  }

  // 获取文件的路径
  getComponentPagePath(page, root = '') {
    if (AbsolutePathExp.test(page)) {
      page = page.substring(1)
    }
    return path.posix.join(root, page)
  }

  // 对此如果存在目录名为node_modules的，可能会出错
  getComponentPageName(path) {
    if (/node_modules/.test(path)) {
      return `node_modules${path.split('node_modules')[1]}`
    }
    return path
  }

  // 获取Page页面中的入口文件
  async getComponentsEntry(components, instance) {
    const { usingComponents = {} } = await readJson(`${instance}.json`)
      .catch(err => err && err.code !== 'ENOENT' && console.error(err)) || {}

    const basePath = this.base
    const componentDirPath = parse(instance).dir
    const componentsPath = values(usingComponents)
    for (const componentPath of componentsPath) {
      if (componentPath.indexOf('plugin://') === 0) continue
      let component = this.getAbsoultePath(componentPath, componentDirPath)
      if (components.findIndex(item => item.component === component) < 0) {
        const entryPath = path.posix.join(...path.relative(basePath, component).split(path.sep))
        components.push({
          component: component,
          name: this.getComponentPageName(entryPath),
          path: entryPath
        })
        await this.getComponentsEntry(components, component)
      }
    }
  }

  getAbsoultePath(_path, currentFileDir) {
    const base = this.base
    if (!path.isAbsolute(currentFileDir)) {
      currentFileDir = path.resolve(base, currentFileDir)
    }
    let finalPath
    if (!NotNodeNodulesExp.test(_path)) {
      finalPath = resolve(base, '../node_modules', _path)
    }
    else if (AbsolutePathExp.test(_path)) {
      // 组件库中使用/相对的是组件库的目录
      if (/node_modules/.test(currentFileDir)) {
        // 通常打包好的包名是
        const packageName = ['lib', 'packages', 'dist', 'es', 'src'].join('\\\/|\\\/')
        const packageNameExp = new RegExp(`\(\\\/${packageName}\\\/\)`)
        const dir = currentFileDir.split(packageNameExp)[0] + RegExp.$1
        finalPath = resolve(dir, _path.substring(1))
      } else {
        finalPath = resolve(base, _path.substring(1))
      }
    }
    else {
      finalPath = resolve(currentFileDir, _path)
    }
    return finalPath
  }

  // 获取tabbar的图片
  async getTabBarIcons(tabBar = {}) {
    const tabBarIcons = new Set()
    const tabBarList = tabBar.list || tabBar.items || []
    for (const tabBarItem of tabBarList) {
      let icon = tabBarItem.iconPath || tabBarItem.icon || ''
      let selectIcon = tabBarItem.selectedIconPath || tabBarItem.activeIcon || ''
      if (icon) {
        tabBarIcons.add(this.getComponentPagePath(icon))
      }
      if (selectIcon) {
        tabBarIcons.add(this.getComponentPagePath(selectIcon))
      }
    }

    this.tabBarIcons = tabBarIcons
  }

  // 获取入口文件
  async getEntryResource() {
    const basePath = this.base
    const appJSONFile = resolve(basePath, 'app.json')
    const appJson = await readJson(appJSONFile)
    const { pages = [], tabBar = {} } = appJson
    // 微信小程序和支付宝小程序的分包命名不一样
    const subpackages = appJson.subpackages || appJson.subPackages || []
    const componentsEntries = []
    const pageEntries = []

    // forEach 不能用异步await
    for (let page of pages) {
      const entryPath = this.getComponentPagePath(page)
      pageEntries.push({
        name: this.getComponentPageName(entryPath),
        path: entryPath
      })
      await this.getComponentsEntry(componentsEntries, resolve(basePath, page))
    }

    // 处理分包入口
    for (const subpackage of subpackages) {
      const { root, pages = [] } = subpackage;

      await Promise.all(
        pages.map(async page => {
          const entryPath = this.getComponentPagePath(page, root)
          pageEntries.push({
            name: this.getComponentPageName(entryPath),
            path: entryPath
          })
          return this.getComponentsEntry(componentsEntries, resolve(basePath, root, page))
        })
      )
    }

    await this.getTabBarIcons(tabBar)

    return [
      {
        name: 'app',
        path: 'app'
      },
      ...pageEntries,
      ...componentsEntries
    ]
  }

  // 获取xml相关的依赖，这里主要是指import-sjs或者微信的wxs或者其他
  async getXMLResource(entries) {
    const targetsTag = Object.keys(Targets).map(item => Targets[item].xjsTag)
    const targetsName = Object.keys(Targets).map(item => `.${Targets[item].xmlName}`)
    for (let i = 0, l = entries.length; i < l; i++) {
      const entry = entries[i]
      const extname = path.extname(entry)
      if (targetsName.indexOf(extname) > -1) {
        const source = readFileSync(`${resolve(this.base, entry)}`, 'utf8')
        const xmlContent = `${ROOT_TAG_START}${source}${ROOT_TAG_END}`
        const parser = sax.parser(false, { lowercase: true })
        parser.onopentag = ({ name, attributes }) => {
          // opened a tag.  node has "name" and "attributes"
          // 使用了wxs
          if (targetsTag.indexOf(name) > -1) {
            const src = attributes.src
            this.addSJSResource(entries, entry, src)
          }
        }
        parser.write(xmlContent).close()
      }
    }
  }

  addSJSResource(entries, entry, url) {
    const entryPath = this.getAbsoultePath(url, path.dirname(entry))
    const src = path.relative(this.base, entryPath).replace(/\\/g, '\/')
    if (entries.indexOf(src) < 0) {
      entries.push(src)
      this.getSJSResource(entries, src)
    }
  }

  // 获取sjs里面的依赖，这里主要是依赖其他的sjs文件
  async getSJSResource(entries, entry) {
    const source = readFileSync(`${resolve(this.base, entry)}`, 'utf8')
    const commentRegExp = /(\/\*([\s\S]*?)\*\/|([^:]|^)\/\/(.*)$)/mg;

    function commentReplace(match, multi, multiText, singlePrefix) {
      return singlePrefix || '';
    }
    const removeCommendSource = source.replace(commentRegExp, commentReplace)
    // 获取里面的依赖 主要是require 和 import表达式
    const importReg = /(?:^|\s|,|;|=)(?:import|require)\s*\(\s*['"]([\w./]+)['"]\s*\)/mg
    removeCommendSource.replace(importReg, (match, url) => {
      this.addSJSResource(entries, entry, url)
      return match
    })
  }

  // 获取acss和wxss相关的依赖
  async getCSSResourceByEntries(entries) {
    const targetsName = Object.keys(Targets).map(item => `.${Targets[item].cssName}`)
    for (let i = 0, l = entries.length; i < l; i++) {
      const entry = entries[i]
      const extname = path.extname(entry)
      if (targetsName.indexOf(extname) > -1) {
        await this.getCSSResource(entries, entry)
      }
    }
  }

  // 添加css依赖
  addCSSResource(entries, entry, url) {
    const entryPath = this.getAbsoultePath(url, path.dirname(entry))
    const src = path.relative(this.base, entryPath).replace(/\\/g, '\/')
    if (entries.indexOf(src) < 0) {
      entries.push(src)
      this.getCSSResource(entries, src)
    }
  }

  // 获取单个文件的依赖
  async getCSSResource(entries, entry) {
    const source = readFileSync(`${resolve(this.base, entry)}`, 'utf8')
    const commentRegExp = /(\/\*([\s\S]*?)\*\/|([^:]|^)\/\/(.*)$)/mg;

    function commentReplace(match, multi, multiText, singlePrefix) {
      return singlePrefix || '';
    }
    const removeCommendSource = source.replace(commentRegExp, commentReplace)
    const importReg = /(?:^|\s)(?:@import)\s*['"]([\w./]+)['"]\s*/mg
    removeCommendSource.replace(importReg, (match, url) => {
      this.addCSSResource(entries, entry, url)
      return match
    })
  }
}
