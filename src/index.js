/**
 * function: index
 * author  : wq
 * update  : 2019/10/18 11:23
 */
import { uniq, values, defaults } from 'lodash'
import fs, { readJson, stat, readFile, existsSync } from 'fs-extra'
import path, { resolve, parse, join } from 'path'
import MultiEntryPlugin from 'webpack/lib/MultiEntryPlugin'
import SingleEntryPlugin from 'webpack/lib/SingleEntryPlugin'
import { ConcatSource, RawSource } from 'webpack-sources'
import { Template } from 'webpack'
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
    compiler.hooks.afterEmit.tapAsync('MiniWebpackPlugin', this.try(
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

    const patterns = entryResources
      .map(resource => `${resource.path}.*`)
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
    const { commonModuleName, assetsChunkName } = this.options
    const { target } = compilation.options
    const commonChunkName = stripExt(commonModuleName)
    const globalVar = Targets[target.name].global

    // 删除__assets_chunk_name__ 这个入口的打包文件，不需要打包出来
    compilation.hooks.beforeChunkAssets.tap('MinWebpackPlugin', () => {
      const assetsChunkIndex = compilation.chunks.findIndex(
        ({ name }) => name === assetsChunkName
      )
      if (assetsChunkIndex > -1) {
        compilation.chunks.splice(assetsChunkIndex, 1)
      }
    })
    compilation.mainTemplate.hooks.render.tap('MinWebpackPlugin', (source, chunk, hash, moduleTemplate, dependencyTemplates) => {
      const entryResources = this.entryResources
      if (entryResources.findIndex(({ name }) => name === chunk.name) > -1){
        const source = new ConcatSource()
        const globalRequire = 'require'
        let webpackRequire = `${globalRequire}("${path.posix.relative(`${chunk.name}`, `webpack-require.js`)}")`.replace('../', './')
        source.add(`var webpackRequire = ${webpackRequire};\n`)
        source.add(`webpackRequire(`)
        source.add(`${JSON.stringify(chunk.entryModule.id)}, `)
        source.add(compilation.mainTemplate.hooks.modules.call(
          new RawSource(""),
          chunk,
          hash,
          moduleTemplate,
          dependencyTemplates
        ))
        source.add(`)`)
        return source
      }

      return source
    })

    compilation.chunkTemplate.hooks.render.tap('MinWebpackPlugin', (module, chunk, moduleTemplate, dependencyTemplates) => {
      const moduleSources = Template.renderChunkModules(
        chunk,
        m => typeof m.source === "function",
        moduleTemplate,
        dependencyTemplates
      );
      const core = compilation.chunkTemplate.hooks.modules.call(
        moduleSources,
        chunk,
        moduleTemplate,
        dependencyTemplates
      );
      const source = new ConcatSource()
      source.add(`module.exports = `)
      source.add(core)
      return source
    })

    compilation.hooks.additionalAssets.tapAsync('MiniPlugin', callback => {
      compilation.assets['webpack-require.js'] = new ConcatSource(
        fs.readFileSync(join(__dirname, './lib/require.js'), 'utf8')
      )
      callback()
    })
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
