/**
 * function: index
 * author  : wq
 * update  : 2019/10/18 11:23
 */
import { uniq, values, defaults } from 'lodash'
import fs, { readJson, stat, readFile, existsSync } from 'fs-extra'
import { dirname, basename, resolve, parse, relative, sep, join } from 'path'
import MultiEntryPlugin from 'webpack/lib/MultiEntryPlugin'
import SingleEntryPlugin from 'webpack/lib/SingleEntryPlugin'
import { ConcatSource } from 'webpack-sources'
import globby from 'globby'
import MinProgram from './MinProgram'
import utils from './utils'

export const { Targets } = require('./Targets')

const DEPS_MAP = {}

const stripExt = path => {
  const { dir, name } = parse(path)
  return join(dir, name)
}

class MiniWebpackPlugin extends MinProgram {
  constructor(options) {
    if (MiniWebpackPlugin.inited) {
      throw new Error('minprogram-webpack-plugin 实例化一次就可以了，不支持多次实例化')
    }
    MiniWebpackPlugin.inited = true
    super(options)
  }

  try(handler) {
    return async (arg, callback) => {
      try {
        await handler(arg);
        callback();
      }
      catch (err) {
        callback(err);
      }
    }
  }

  async apply(compiler) {
    this.initOptions(compiler)
    compiler.hooks.compilation.tap('MiniWebpackPlugin', this.setCompilation.bind(this))
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
        }
      ))
    // compiler.hooks.afterCompile.tapAsync('MiniWebpackPlugin',
    //   this.try(
    //     async compilation => {
    //       console.log(44444444444, 'afterCompile', compilation)
    //     }
    //   ))
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

  addScriptEntry(compiler, entry, name) {
    compiler.hooks.make.tapAsync('MiniWebpackPlugin', (compilation, callback) => {
      const dep = SingleEntryPlugin.createDependency(entry, name)
      compilation.addEntry(this.base, dep, name, callback)
    })
  }

  compileScripts(compiler) {
    // this.applyCommonsChunk(compiler);
    this.entryResources
      .filter(resource => resource !== 'app')
      .forEach(resource => {
        const fullPath = this.getFullScriptPath(resource)
        if (/node_modules/.test(resource)) {
          resource = `node_modules${resource.split('node_modules')[1]}`
        }
        this.addScriptEntry(compiler, fullPath, resource)
      })
  }

  getFullScriptPath(path) {
    const {
      base,
      options: { extensions }
    } = this
    for (const ext of extensions) {
      const fullPath = resolve(base, path + ext)
      if (existsSync(fullPath)) {
        return fullPath
      }
    }
  }

  async compileAssets(compiler) {
    const {
      options: { include, exclude, dot, assetsChunkName, extensions },
      entryResources
    } = this


    compiler.hooks.compilation.tap('MiniWebpackPlugin', compilation => {
      compilation.hooks.beforeChunkAssets.tap('MiniWebpackPlugin', () => {
        const assetsChunkIndex = compilation.chunks.findIndex(
          ({ name }) => name === assetsChunkName
        );
        if (assetsChunkIndex > -1) {
          compilation.chunks.splice(assetsChunkIndex, 1);
        }
      })
      compilation.hooks.optimizeChunks.tap('MiniWebpackPlugin', chunks => {
        for (const chunk of chunks) {
          if (chunk.hasEntryModule()) {
            // 记录模块之间依赖关系
            for (const module of chunk.getModules()) {
              if (!module.isEntryModule()) {
                const resourcePath = module.resource
                let relPath = utils.getDistPath(resourcePath)
                let chunkName = chunk.name + '.js'
                utils.setMapValue(DEPS_MAP, relPath, chunkName)

                module._usedModules = DEPS_MAP[relPath]
              }
            }
          }
        }
      })
    })

    const patterns = entryResources
      .map(resource => `${resource}.*`)
      .concat(include)

    const entries = await globby(patterns, {
      cwd: this.base,
      nodir: true,
      realpath: true,
      ignore: [...extensions.map(ext => `**/*${ext}`), ...exclude],
      dot
    })
    this.addEntries(compiler, entries, assetsChunkName)
  }

  addEntries(compiler, entries, chunkName) {
    compiler.apply(new MultiEntryPlugin(this.base, entries, chunkName));
  }

  // 处理compilation
  setCompilation(compilation) {
    const { commonModuleName } = this.options
    const { target } = compilation.options
    const commonChunkName = stripExt(commonModuleName)
    const globalVar = Targets[target.name].global

    // compilation.mainTemplate.hooks.assetPath.tap('MinWebpackPlugin', (path) => {
    //   return utils.getDistPath(path)
    // })
    compilation.hooks.additionalAssets.tapAsync('MiniPlugin', callback => {
      compilation.assets['webpack-require.js'] = new ConcatSource(
        fs.readFileSync(join(__dirname, './lib/require.js'), 'utf8')
      )
      callback()
    })

    compilation.chunkTemplate.hooks.render.tap('MinWebpackPlugin', (core, chunk) => {
      console.log(111111, this.entryResources, chunk.resource)
      const absoluteEntryPath = this.entryResources.map(item => path.resolve(item))
      if (absoluteEntryPath.indexOf(chunk.resource) >= 0) {
        const relativePath = relative(dirname(name), `./webpack-require`)
        const posixPath = relativePath.replace(/\\/g, '/')
        const source = core.source()

        // eslint-disable-next-line max-len
        const injectContent = `webpackRequire = require("./${posixPath}"); \n webpackRequire(${chunk.id}, )`

        if (source.indexOf(injectContent) < 0) {
          const concatSource = new ConcatSource(core);
          concatSource.add(injectContent)
          return concatSource
        }
      }
      return core
    })

    compilation.mainTemplate.hooks.bootstrap.tap('MinWebpackPlugin', (source, chunk) => {
      const windowRegExp = new RegExp('window', 'g')
      if (chunk.name === commonChunkName) {
        return source.replace(windowRegExp, globalVar)
      }
      return source
    })

    // override `require.ensure()`
    compilation.mainTemplate.hooks.requireEnsure.tap('MinWebpackPlugin', () => 'throw new Error("Not chunk loading available");')
  }

  getChunkResourceRegExp() {
    if (this._chunkResourceRegex) {
      return this._chunkResourceRegex;
    }

    const {
      options: { extensions }
    } = this
    const exts = extensions
      .map(ext => ext.replace(/\./g, '\\.'))
      .map(ext => `(${ext}$)`)
      .join('|')
    return new RegExp(exts);
  }

  dealChunks(compiler) {
    const entryFullPath = this.entryResources.map(this.getFullScriptPath.bind(this))
    compiler.options.optimization.splitChunks = {
      chunks: (chunk) => {
        console.log(222222222, chunk.name)
        return entryFullPath.find()
      }
    }
      // minSize: 30000, // 最小尺寸，30000
      // minChunks: 1, // 最小 chunk ，默认1
      // maxAsyncRequests: 5, // 最大异步请求数， 默认5
      // maxInitialRequests: 3, // 最大初始化请求书，默认3
      // automaticNameDelimiter: '~',// 打包分隔符
      // name: function () {
      //   return this.options.commonModuleName
      // }, // 打包后的名称，此选项可接收 function
      // cacheGroups: { // 这里开始设置缓存的 chunks
      //   priority: 0, // 缓存组优先级
      //   vendor: { // key 为entry中定义的 入口名称
      //     chunks: 'initial', // 必须三选一： "initial" | "all" | "async"(默认就是async)
      //     test: /react|lodash/, // 正则规则验证，如果符合就提取 chunk
      //     name: 'vendor', // 要缓存的 分隔出来的 chunk 名称
      //     minSize: 30000,
      //     minChunks: 1,
      //     enforce: true,
      //     maxAsyncRequests: 5, // 最大异步请求数， 默认1
      //     maxInitialRequests: 3, // 最大初始化请求书，默认1
      //     reuseExistingChunk: true // 可设置是否重用该chunk
      //   }
      // }
  }

  async run(compiler) {
    this.entryResources = await this.getEntryResource()
    this.compileScripts(compiler)
    await this.compileAssets(compiler)
  }
}

export default MiniWebpackPlugin
