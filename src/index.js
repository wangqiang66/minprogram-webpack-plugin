/**
 * function: index
 * author  : wq
 * update  : 2019/10/18 11:23
 */
import { uniq, values, defaults } from 'lodash'
import fs, { readJson, stat, readFile, existsSync } from 'fs-extra'
import path, { dirname, basename, resolve, parse, relative, sep, join } from 'path'
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
    return async function (...args) {
      const arg = args.slice(0, args.length - 1)
      const callback = args[args.length - 1]
      try {
        await handler(...arg);
        callback()
      }
      catch (err) {
        callback(err)
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
          await this.run(compiler)
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
    // compiler.hooks.thisCompilation.tap('MiniWebpackPlugin1', (compilation, compilationParams) => {
    //   compilation.hooks.buildModule.tap('MiniWebpackPlugin1', () => {
    //     console.log(444444444444, 'buildModule')
    //   })
    //   compilation.hooks.rebuildModule.tap('MiniWebpackPlugin1', () => {
    //     console.log(444444444444, 'rebuildModule')
    //   })
    //   compilation.hooks.failedModule.tap('MiniWebpackPlugin1', () => {
    //     console.log(444444444444, 'failedModule')
    //   })
    //   compilation.hooks.succeedModule.tap('MiniWebpackPlugin1', () => {
    //     console.log(444444444444, 'succeedModule')
    //   })
    //   compilation.hooks.addEntry.tap('MiniWebpackPlugin1', () => {
    //     console.log(444444444444, 'addEntry')
    //   })
    //   compilation.hooks.failedEntry.tap('MiniWebpackPlugin1', () => {
    //     console.log(444444444444, 'failedEntry')
    //   })
    //   compilation.hooks.succeedEntry.tap('MiniWebpackPlugin1', () => {
    //     console.log(444444444444, 'succeedEntry')
    //   })
    //   compilation.hooks.dependencyReference.tap('MiniWebpackPlugin1', () => {
    //     console.log(444444444444, 'dependencyReference')
    //   })
    //   compilation.hooks.finishModules.tapAsync('MiniWebpackPlugin', this.try(
    //     () => {
    //       console.log(444444444444, 'finishModules')
    //     }
    //   ))
    //   compilation.hooks.finishRebuildingModule.tap('MiniWebpackPlugin1', () => {
    //     console.log(444444444444, 'finishRebuildingModule')
    //   })
    //   compilation.hooks.unseal.tap('MiniWebpackPlugin1', () => {
    //     console.log(444444444444, 'unseal')
    //   })
    //   compilation.hooks.seal.tap('MiniWebpackPlugin1', () => {
    //     console.log(444444444444, 'seal')
    //   })
    //   compilation.hooks.beforeChunks.tap('MiniWebpackPlugin1', () => {
    //     console.log(444444444444, 'beforeChunks')
    //   })
    //   compilation.hooks.afterChunks.tap('MiniWebpackPlugin1', () => {
    //     console.log(444444444444, 'afterChunks')
    //   })
    //   compilation.hooks.optimizeDependenciesBasic.tap('MiniWebpackPlugin1', () => {
    //     console.log(444444444444, 'optimizeDependenciesBasic')
    //   })
    //   compilation.hooks.optimizeDependencies.tap('MiniWebpackPlugin1', () => {
    //     console.log(444444444444, 'optimizeDependencies')
    //   })
    //   compilation.hooks.optimizeDependenciesAdvanced.tap('MiniWebpackPlugin1', () => {
    //     console.log(444444444444, 'optimizeDependenciesAdvanced')
    //   })
    //   compilation.hooks.afterOptimizeDependencies.tap('MiniWebpackPlugin1', () => {
    //     console.log(444444444444, 'afterOptimizeDependencies')
    //   })
    //   compilation.hooks.optimize.tap('MiniWebpackPlugin1', () => {
    //     console.log(444444444444, 'optimize')
    //   })
    //   compilation.hooks.optimizeModulesBasic.tap('MiniWebpackPlugin1', () => {
    //     console.log(444444444444, 'optimizeModulesBasic')
    //   })
    //   compilation.hooks.optimizeModules.tap('MiniWebpackPlugin1', () => {
    //     console.log(444444444444, 'optimizeModules')
    //   })
    //   compilation.hooks.optimizeModulesAdvanced.tap('MiniWebpackPlugin1', () => {
    //     console.log(444444444444, 'optimizeModulesAdvanced')
    //   })
    //   compilation.hooks.afterOptimizeModules.tap('MiniWebpackPlugin1', () => {
    //     console.log(444444444444, 'afterOptimizeModules')
    //   })
    //   compilation.hooks.optimizeChunksBasic.tap('MiniWebpackPlugin1', () => {
    //     console.log(444444444444, 'optimizeChunksBasic')
    //   })
    //   compilation.hooks.optimizeChunks.tap('MiniWebpackPlugin1', () => {
    //     console.log(444444444444, 'optimizeChunks')
    //   })
    //   compilation.hooks.optimizeChunksAdvanced.tap('MiniWebpackPlugin1', () => {
    //     console.log(444444444444, 'optimizeChunksAdvanced')
    //   })
    //   compilation.hooks.afterOptimizeChunks.tap('MiniWebpackPlugin1', () => {
    //     console.log(444444444444, 'afterOptimizeChunks')
    //   })
    //   compilation.hooks.optimizeTree.tapAsync('MiniWebpackPlugin1', this.try(
    //     () => {
    //       console.log(444444444444, 'optimizeTree')
    //     }
    //   ))
    //   compilation.hooks.afterOptimizeTree.tap('MiniWebpackPlugin1', () => {
    //     console.log(444444444444, 'afterOptimizeTree')
    //   })
    //   compilation.hooks.optimizeChunkModulesBasic.tap('MiniWebpackPlugin1', () => {
    //     console.log(444444444444, 'optimizeChunkModulesBasic')
    //   })
    //   compilation.hooks.optimizeChunkModules.tap('MiniWebpackPlugin1', () => {
    //     console.log(444444444444, 'optimizeChunkModules')
    //   })
    //   compilation.hooks.optimizeChunkModulesAdvanced.tap('MiniWebpackPlugin1', () => {
    //     console.log(444444444444, 'optimizeChunkModulesAdvanced')
    //   })
    //   compilation.hooks.afterOptimizeChunkModules.tap('MiniWebpackPlugin1', () => {
    //     console.log(444444444444, 'afterOptimizeChunkModules')
    //   })
    //   compilation.hooks.shouldRecord.tap('MiniWebpackPlugin1', () => {
    //     console.log(444444444444, 'shouldRecord')
    //   })
    //   compilation.hooks.reviveModules.tap('MiniWebpackPlugin1', () => {
    //     console.log(444444444444, 'reviveModules')
    //   })
    //   compilation.hooks.optimizeModuleOrder.tap('MiniWebpackPlugin1', () => {
    //     console.log(444444444444, 'optimizeModuleOrder')
    //   })
    //   compilation.hooks.advancedOptimizeModuleOrder.tap('MiniWebpackPlugin1', () => {
    //     console.log(444444444444, 'advancedOptimizeModuleOrder')
    //   })
    //   compilation.hooks.beforeModuleIds.tap('MiniWebpackPlugin1', () => {
    //     console.log(444444444444, 'beforeModuleIds')
    //   })
    //   compilation.hooks.moduleIds.tap('MiniWebpackPlugin1', () => {
    //     console.log(444444444444, 'moduleIds')
    //   })
    //   compilation.hooks.optimizeModuleIds.tap('MiniWebpackPlugin1', () => {
    //     console.log(444444444444, 'optimizeModuleIds')
    //   })
    //   compilation.hooks.afterOptimizeModuleIds.tap('MiniWebpackPlugin1', () => {
    //     console.log(444444444444, 'afterOptimizeModuleIds')
    //   })
    //   compilation.hooks.reviveChunks.tap('MiniWebpackPlugin1', () => {
    //     console.log(444444444444, 'reviveChunks')
    //   })
    //   compilation.hooks.optimizeChunkOrder.tap('MiniWebpackPlugin1', () => {
    //     console.log(444444444444, 'optimizeChunkOrder')
    //   })
    //   compilation.hooks.beforeChunkIds.tap('MiniWebpackPlugin1', () => {
    //     console.log(444444444444, 'beforeChunkIds')
    //   })
    //   compilation.hooks.optimizeChunkIds.tap('MiniWebpackPlugin1', () => {
    //     console.log(444444444444, 'optimizeChunkIds')
    //   })
    //   compilation.hooks.afterOptimizeChunkIds.tap('MiniWebpackPlugin1', () => {
    //     console.log(444444444444, 'afterOptimizeChunkIds')
    //   })
    //   compilation.hooks.recordModules.tap('MiniWebpackPlugin1', () => {
    //     console.log(444444444444, 'recordModules')
    //   })
    //   compilation.hooks.recordChunks.tap('MiniWebpackPlugin1', () => {
    //     console.log(444444444444, 'recordChunks')
    //   })
    //   compilation.hooks.beforeHash.tap('MiniWebpackPlugin1', () => {
    //     console.log(444444444444, 'beforeHash')
    //   })
    //   compilation.hooks.contentHash.tap('MiniWebpackPlugin1', () => {
    //     console.log(444444444444, 'contentHash')
    //   })
    //   compilation.hooks.afterHash.tap('MiniWebpackPlugin1', () => {
    //     console.log(444444444444, 'afterHash')
    //   })
    //   compilation.hooks.recordHash.tap('MiniWebpackPlugin1', () => {
    //     console.log(444444444444, 'recordHash')
    //   })
    //   compilation.hooks.record.tap('MiniWebpackPlugin1', () => {
    //     console.log(444444444444, 'record')
    //   })
    //   compilation.hooks.beforeModuleAssets.tap('MiniWebpackPlugin1', () => {
    //     console.log(444444444444, 'beforeModuleAssets')
    //   })
    //   compilation.hooks.shouldGenerateChunkAssets.tap('MiniWebpackPlugin1', () => {
    //     console.log(444444444444, 'shouldGenerateChunkAssets')
    //   })
    //   compilation.hooks.beforeChunkAssets.tap('MiniWebpackPlugin1', () => {
    //     console.log(444444444444, 'beforeChunkAssets')
    //   })
    //   compilation.hooks.additionalChunkAssets.tap('MiniWebpackPlugin1', () => {
    //     console.log(444444444444, 'additionalChunkAssets')
    //   })
    //   compilation.hooks.additionalAssets.tapAsync('MiniWebpackPlugin1', this.try(
    //     () => {
    //       console.log(444444444444, 'additionalAssets')
    //     }
    //   ))
    //   compilation.hooks.optimizeChunkAssets.tapAsync('MiniWebpackPlugin1', this.try(
    //     () => {
    //       console.log(444444444444, 'optimizeChunkAssets')
    //     }
    //   ))
    //   compilation.hooks.afterOptimizeChunkAssets.tap('MiniWebpackPlugin1', () => {
    //     console.log(444444444444, 'afterOptimizeChunkAssets')
    //   })
    //   compilation.hooks.optimizeAssets.tapAsync('MiniWebpackPlugin1', this.try(
    //     () => {
    //       console.log(444444444444, 'optimizeAssets')
    //     }
    //   ))
    //   compilation.hooks.afterOptimizeAssets.tap('MiniWebpackPlugin1', () => {
    //     console.log(444444444444, 'afterOptimizeAssets')
    //   })
    //   compilation.hooks.needAdditionalSeal.tap('MiniWebpackPlugin1', () => {
    //     console.log(444444444444, 'needAdditionalSeal')
    //   })
    //   compilation.hooks.afterSeal.tapAsync('MiniWebpackPlugin1', this.try(
    //     () => {
    //       console.log(444444444444, 'afterSeal')
    //     }
    //   ))
    //   compilation.hooks.chunkHash.tap('MiniWebpackPlugin1', () => {
    //     console.log(444444444444, 'chunkHash')
    //   })
    //   compilation.hooks.moduleAsset.tap('MiniWebpackPlugin1', () => {
    //     console.log(444444444444, 'moduleAsset')
    //   })
    //   compilation.hooks.chunkAsset.tap('MiniWebpackPlugin1', () => {
    //     console.log(444444444444, 'chunkAsset')
    //   })
    //   compilation.hooks.assetPath.tap('MiniWebpackPlugin1', () => {
    //     console.log(444444444444, 'assetPath')
    //   })
    //   compilation.hooks.needAdditionalPass.tap('MiniWebpackPlugin1', () => {
    //     console.log(444444444444, 'needAdditionalPass')
    //   })
    //   compilation.hooks.childCompiler.tap('MiniWebpackPlugin1', () => {
    //     console.log(444444444444, 'childCompiler')
    //   })
    //   compilation.hooks.log.tap('MiniWebpackPlugin1', () => {
    //     console.log(444444444444, 'log')
    //   })
    //   compilation.hooks.normalModuleLoader.tap('MiniWebpackPlugin1', () => {
    //     console.log(444444444444, 'normalModuleLoader')
    //   })
    //   compilation.hooks.optimizeExtractedChunksBasic.tap('MiniWebpackPlugin1', () => {
    //     console.log(444444444444, 'optimizeExtractedChunksBasic')
    //   })
    //   compilation.hooks.optimizeExtractedChunks.tap('MiniWebpackPlugin1', () => {
    //     console.log(444444444444, 'optimizeExtractedChunks')
    //   })
    //   compilation.hooks.optimizeExtractedChunksAdvanced.tap('MiniWebpackPlugin1', () => {
    //     console.log(444444444444, 'optimizeExtractedChunksAdvanced')
    //   })
    //   compilation.hooks.afterOptimizeExtractedChunks.tap('MiniWebpackPlugin1', () => {
    //     console.log(444444444444, 'afterOptimizeExtractedChunks')
    //   })
    // })

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
      // console.log(111111111, dep)
      compilation.addEntry(this.base, dep, name, callback)
    })
  }

  compileScripts(compiler) {
    // this.applyCommonsChunk(compiler);
    this.entryResources
      .filter(({ name }) => name !== 'app')
      .forEach(({ path, name }) => {
        const fullPath = this.getFullScriptPath(path)
        this.addScriptEntry(compiler, fullPath, name)
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


    // compiler.hooks.compilation.tap('MiniWebpackPlugin', compilation => {
    //   compilation.hooks.beforeChunkAssets.tap('MiniWebpackPlugin', () => {
    //     const assetsChunkIndex = compilation.chunks.findIndex(
    //       ({ name }) => name === assetsChunkName
    //     );
    //     if (assetsChunkIndex > -1) {
    //       compilation.chunks.splice(assetsChunkIndex, 1);
    //     }
    //   })
    //   compilation.hooks.optimizeChunks.tap('MiniWebpackPlugin', chunks => {
    //     for (const chunk of chunks) {
    //       if (chunk.hasEntryModule()) {
    //         // 记录模块之间依赖关系
    //         for (const module of chunk.getModules()) {
    //           if (!module.isEntryModule()) {
    //             const resourcePath = module.resource
    //             let relPath = utils.getDistPath(resourcePath)
    //             let chunkName = chunk.name + '.js'
    //             utils.setMapValue(DEPS_MAP, relPath, chunkName)
    //
    //             module._usedModules = DEPS_MAP[relPath]
    //           }
    //         }
    //       }
    //     }
    //   })
    // })

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
    compilation.mainTemplate.hooks.render.tap('MinWebpackPlugin', (source, chunk, hash, moduleTemplate, dependencyTemplates) => {
      const entryResources = this.entryResources
      if (path.extname(chunk.entryModule.resource || '') === '.js' && entryResources.findIndex(({ name }) => name === chunk.name) > -1){
        const source = new ConcatSource()
        const globalRequire = 'require'
        console.log(111111, chunk.name, `${this.base}/webpack-require.js`)
        console.log(11111, chunk)
        let webpackRequire = `${globalRequire}("${path.posix.relative(`${chunk.name}`, `webpack-require.js`)}")`.replace('../', './')
        source.add(`var webpackRequire = ${webpackRequire};\n`)
        return source
      }
      return source
    })

    // compilation.mainTemplate.hooks.assetPath.tap('MinWebpackPlugin', (path) => {
    //   return utils.getDistPath(path)
    // })
    compilation.hooks.additionalAssets.tapAsync('MiniPlugin', callback => {
      compilation.assets['webpack-require.js'] = new ConcatSource(
        fs.readFileSync(join(__dirname, './lib/require.js'), 'utf8')
      )
      callback()
    })

    // compilation.chunkTemplate.hooks.render.tap('MinWebpackPlugin', (core, chunk) => {
    //   console.log(111111, this.entryResources, chunk, chunk.entryModule)
    //   const absoluteEntryPath = this.entryResources.map(item => path.resolve(item))
    //   if (absoluteEntryPath.indexOf(chunk.resource) >= 0) {
    //     const relativePath = relative(dirname(name), `./webpack-require`)
    //     const posixPath = relativePath.replace(/\\/g, '/')
    //     const source = core.source()
    //
    //     // eslint-disable-next-line max-len
    //     const injectContent = `webpackRequire = require("./${posixPath}"); \n `
    //
    //     if (source.indexOf(injectContent) < 0) {
    //       const concatSource = new ConcatSource(core);
    //       concatSource.add(injectContent)
    //       return concatSource
    //     }
    //   }
    //   return core
    // })

    // compilation.mainTemplate.hooks.bootstrap.tap('MinWebpackPlugin', (source, chunk) => {
    //   const windowRegExp = new RegExp('window', 'g')
    //   if (chunk.name === commonChunkName) {
    //     return source.replace(windowRegExp, globalVar)
    //   }
    //   return source
    // })
    //
    // // override `require.ensure()`
    // compilation.mainTemplate.hooks.requireEnsure.tap('MinWebpackPlugin', () => 'throw new Error("Not chunk loading available");')
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

  async run(compiler) {
    this.entryResources = await this.getEntryResource()
    this.compileScripts(compiler)
    await this.compileAssets(compiler)
  }
}

export default MiniWebpackPlugin
