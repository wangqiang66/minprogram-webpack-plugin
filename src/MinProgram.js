import path, { parse, resolve } from 'path'
import { readJson } from 'fs-extra'

/**
 * function: 处理小程序的入口
 * author  : wq
 * update  : 2019/10/23 17:45
 */
import { getBasePath, setWebpackTarget } from './MinBase'
import { values } from 'lodash'
import MinOptions from './MinOptions'

const AbsolutePathExp = /^\//

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
      let component
      if (!/^[./]/.test(componentPath)) {
        component = resolve(basePath, '../node_modules', componentPath)
      }
      else if (AbsolutePathExp.test(componentPath)) {
        if (/node_modules/.test(componentDirPath)) {
          // 通常打包好的包名是
          const packageName = ['lib', 'packages', 'dist', 'es', 'src'].join('\\\/|\\\/')
          const packageNameExp = new RegExp(`\(\\\/${packageName}\\\/\)`)
          const dir = componentDirPath.split(packageNameExp)[0] + RegExp.$1
          component = resolve(dir, componentPath.substring(1))
        } else {
          component = resolve(basePath, componentPath.substring(1))
        }
      }
      else {
        component = resolve(componentDirPath, componentPath)
      }

      if (components.findIndex(item => item.component !== component) < 0) {
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
}
