/**
 * function: index
 * author  : wq
 * update  : 2019/10/18 11:23
 */
import { readJson, stat, readFile } from 'fs-extra'
import { uniq, values } from 'lodash'
import Targets from 'Targets'


const { dirname, basename, resolve, parse, relative, sep, join } = require('path')

const defaultOptions = {
  clear: true,
  include: [],
  exclude: [],
  dot: false,
  extensions: ['.js'],
  commonModuleName: 'common.js',
  assetsChunkName: '__assets_chunk_name__'
}

const absoluteExp = /^\//

const stripExt = path => {
  const { dir, name } = parse(path)
  return join(dir, name)
}

class MiniWebpackPlugin {

  constructor(options) {
    this.options = { ...defaultOptions, ...options }
    this.options.extensions = uniq([...this.options.extensions, '.js'])
    this.options.include = [].concat(this.options.include)
    this.options.exclude = [].concat(this.options.exclude)
  }

  try = handler => async (arg, callback) => {
    try {
      await handler(arg);
      callback();
    }
    catch (err) {
      callback(err);
    }
  }

  apply(compiler) {
    if (MiniWebpackPlugin.inited) {
      throw new Error('minprogram-webpack-plugin 实例化一次就可以了，不支持多次实例化')
    }

    MiniWebpackPlugin.inited = true

    this.dealTarget(compiler)
    this.getBase(compiler)
    compiler.hooks.run.tapAsync('MiniWebpackPlugin',
      this.try(
        async compiler => {
          await this.run(compiler)
        }
      ))
    compiler.hooks.watchRun.tapAsync('MiniWebpackPlugin',
      this.try(
        async compiler => {
          await this.run(compiler.compiler)
        }
      ))
    compiler.hooks.emit.tapAsync('MiniWebpackPlugin',
      this.try(
        async compilation => {
          await this.toEmitTabBarIcons(compilation)
        }
      ))
    compiler.hooks.afterEmit.tapAsync('MiniWebpackPlugin',
      this.try(
        async compilation => {
          await this.toAddTabBarIconsDependencies(compilation)
          callback()
        }
      ))
  }

  // 处理编译的目标， 默认是微信
  dealTarget(compiler) {
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

  // 获取项目的相对路径, app.json对应这这个路径下
  getBase(compiler) {
    const { base, extensions } = this.options
    if (base) {
      return resolve(base)
    }
    const { options: compilerOptions } = compiler
    const { context, entry } = compilerOptions

    const getEntryFromCompiler = () => {
      if (typeof entry === 'string') {
        return entry
      }
      const extRegExpStr = extensions
        .map(ext => ext.replace(/\./, '\\.'))
        .map(ext => `(${ext})`)
        .join('|')

      const appJSRegExp = new RegExp(`\\bapp(${extRegExpStr})?$`);
      const findAppJS = arr => arr.find(path => appJSRegExp.test(path))

      if (Array.isArray(entry)) {
        return findAppJS(entry)
      }

      if (typeof entry === 'object') {
        for (const key in entry) {
          if (!entry.hasOwnProperty(key)) {
            continue
          }

          const val = entry[key]
          if (typeof val === 'string') {
            return val
          }
          if (Array.isArray(val)) {
            return findAppJS(val)
          }
        }
      }
    }

    const entryFromCompiler = getEntryFromCompiler()

    if (entryFromCompiler) {
      return dirname(entryFromCompiler)
    }

    return context
  }

  // 获取入口文件
  async getEntryResource() {
    const basePath = this.base
    const appJSONFile = resolve(basePath, 'app.json')

    const { pages = [], subpackages, tabBar } = await readJSON(appJSONFile)

    const componentsEntries = new Set()
    const pageEntries = new Set()

    // forEach 不能用异步await
    for (let page of pages) {
      if (absoluteExp.test(page)) {
        page = page.substring(1)
      }
      pageEntries.add(page)
      await this.getComponentsEntry(componentsEntries, resolve(basePath, page))
    }

    // 处理分包入口
    for (const subpackage of subpackages) {
      const { root, pages = [] } = subpackage;

      await Promise.all(
        pages.map(async page => {
          if (absoluteExp.test(page)) {
            page = page.substring(1)
          }
          pageEntries.add(join(root, page))
          return this.getComponentsEntry(componentsEntries, resolve(basePath, root, page))
        })
      );
    }

    this.getTabBarIcons(tabBar)

    return [
      'app',
      ...pageEntries,
      ...componentsEntries
    ]
  }

  // 获取Page中组件的入口
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
      else if (/^[/]/.test(componentPath)) {
        component = resolve(basePath, componentPath.substring(1))
      }
      else {
        component = resolve(componentDirPath, componentPath.substring(1))
      }

      if (!components.has(component)) {
        components.add(relative(basePath, component).split(sep).join('/'))
        await this.getComponentsEntry(components, component)
      }
    }

  }

  // 获取tabbar的图片
  async getTabBarIcons(tabBar) {
    const tabBarIcons = new Set()
    const tabBarList = tabBar.list || tabBar.items || []
    for (const tabBarItem of tabBarList) {
      let icon = tabBarItem.iconPath || tabBarItem.icon || ''
      let selectIcon = tabBarItem.selectedIconPath || tabBarItem.activeIcon || ''
      if (icon) {
        if (absoluteExp.test(icon)) {
          icon = icon.substring(1)
        }
        tabBarIcons.add(icon)
      }
      if (selectIcon) {
        if (absoluteExp.test(selectIcon)) {
          selectIcon = selectIcon.substring(1)
        }
        tabBarIcons.add(selectIcon)
      }
    }

    this.tabBarIcons = tabBarIcons;
  }

  async toEmitTabBarIcons(compilation) {
    const emitIcons = []
    const basePath = this.base
    this.tabBarIcons.forEach(iconPath => {
      const iconSrc = resolve(basePath, iconPath)
      const toEmitIcon = async () => {
        const iconStat = stat(iconSrc)
        const iconSource = await readFile(iconSrc)
        compilation.assets[iconPath] = {
          size: () => iconStat.size,
          source: () => iconSource
        }
      }
      emitIcons.push(toEmitIcon())
    })
    await Promise.all(emitIcons)
  }

  toAddTabBarIconsDependencies(compilation) {
    const { fileDependencies } = compilation
    this.tabBarIcons.forEach(iconPath => {
      if (!~fileDependencies.indexOf(iconPath)) {
        fileDependencies.push(iconPath);
      }
    })
  }

  // 修改模板
  toModifyTemplate(compilation) {
    const { commonModuleName } = this.options
    const { target } = compilation.options
    const commonChunkName = stripExt(commonModuleName)
    const globalVar = target.name === 'Alipay' ? 'my' : 'wx';

    // inject chunk entries
    compilation.chunkTemplate.plugin('render', (core, { name }) => {
      if (this.entryResources.indexOf(name) >= 0) {
        const relativePath = relative(dirname(name), `./${commonModuleName}`);
        const posixPath = relativePath.replace(/\\/g, '/');
        const source = core.source();

        // eslint-disable-next-line max-len
        const injectContent = `; function webpackJsonp() { require("./${posixPath}"); ${globalVar}.webpackJsonp.apply(null, arguments); }`;

        if (source.indexOf(injectContent) < 0) {
          const concatSource = new ConcatSource(core);
          concatSource.add(injectContent);
          return concatSource;
        }
      }
      return core;
    })

    // replace `window` to `global` in common chunk
    compilation.mainTemplate.plugin('bootstrap', (source, chunk) => {
      const windowRegExp = new RegExp('window', 'g');
      if (chunk.name === commonChunkName) {
        return source.replace(windowRegExp, globalVar);
      }
      return source;
    });

    // override `require.ensure()`
    compilation.mainTemplate.plugin(
      'require-ensure',
      () => 'throw new Error("Not chunk loading available");'
    )
  }

  getChunkResourceRegExp() {
    if (this._chunkResourceRegex) {
      return this._chunkResourceRegex;
    }

    const {
      options: { extensions }
    } = this;
    const exts = extensions
      .map(ext => ext.replace(/\./g, '\\.'))
      .map(ext => `(${ext}$)`)
      .join('|');
    return new RegExp(exts);
  }

  applyCommonsChunk(compiler) {
    const {
      options: { commonModuleName },
      entryResources
    } = this;

    const scripts = entryResources.map(::this.getFullScriptPath);

    compiler.apply(
      new CommonsChunkPlugin({
        name: stripExt(commonModuleName),
        minChunks: ({ resource }) => {
          if (resource) {
            const regExp = this.getChunkResourceRegExp();
            return regExp.test(resource) && scripts.indexOf(resource) < 0;
          }
          return false;
        }
      })
    );
  }

  addScriptEntry(compiler, entry, name) {
    compiler.hooks.make.tapAsync('MiniWebpackPlugin', (compilation, callback) => {
      const dep = SingleEntryPlugin.createDependency(entry, name);
      compilation.addEntry(this.base, dep, name, callback)
    })
  }

  compileScripts(compiler) {
    this.applyCommonsChunk(compiler);
    this.entryResources
      .filter(resource => resource !== 'app')
      .forEach(resource => {
        const fullPath = this.getFullScriptPath(resource);
        this.addScriptEntry(compiler, fullPath, resource);
      });
  }

  async run(compiler) {
    this.entryResource = await this.getEntryResource()
    compiler.compilation.tap('MiniWebpackPlugin', ::this.toModifyTemplate)
    this.compileScripts(compiler)
    await this.compileAssets(compiler)
  }
}

exports.Targets = Targets
module.exports = MiniWebpackPlugin
