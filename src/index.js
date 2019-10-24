/**
 * function: index
 * author  : wq
 * update  : 2019/10/18 11:23
 */
import { uniq, values, defaults } from 'lodash'
import { readJson, stat, readFile, existsSync } from 'fs-extra'
import { dirname, basename, resolve, parse, relative, sep, join } from 'path'
import MultiEntryPlugin from 'webpack/lib/MultiEntryPlugin'
import SingleEntryPlugin from 'webpack/lib/SingleEntryPlugin'
import globby from 'globby'
import MinProgram from './MinProgram'

export const { Targets } = require('./Targets')


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

  apply(compiler) {
    this.initOptions(compiler)
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
          console.log(1111111111, 'emit')
          await this.toEmitTabBarIcons(compilation)
        }
      ))
    compiler.hooks.afterEmit.tapAsync('MiniWebpackPlugin',
      this.try(
        async compilation => {
          console.log(1111111111, 'afterEmit')
          await this.toAddTabBarIconsDependencies(compilation)
        }
      ))
    compiler.hooks.entryOption.tap('MiniWebpackPlugin', () => {
      console.log(1111111111, 'entryOption')
    })
    compiler.hooks.afterPlugins.tap('MiniWebpackPlugin', (compiler) => {
      console.log(1111111111, 'afterPlugins')
    })
    compiler.hooks.afterResolvers.tap('MiniWebpackPlugin', (compiler) => {
      console.log(1111111111, 'afterResolvers')
    })
    compiler.hooks.environment.tap('MiniWebpackPlugin', () => {
      console.log(1111111111, 'environment')
    })
    compiler.hooks.afterEnvironment.tap('MiniWebpackPlugin', () => {
      console.log(1111111111, 'afterEnvironment')
    })
    compiler.hooks.normalModuleFactory.tap('MiniWebpackPlugin', () => {
      console.log(1111111111, 'normalModuleFactory')
    })
    compiler.hooks.contextModuleFactory.tap('MiniWebpackPlugin', () => {
      console.log(1111111111, 'contextModuleFactory')
    })
    compiler.hooks.beforeCompile.tapAsync('MiniWebpackPlugin', this.try(
      async compilationParams => {
        console.log(1111111111, 'beforeCompile')
      }
    ))
    compiler.hooks.thisCompilation.tap('MiniWebpackPlugin', () => {
      console.log(1111111111, 'thisCompilation')
    })
    compiler.hooks.compilation.tap('MiniWebpackPlugin', () => {
      console.log(1111111111, 'compilation')
    })
    compiler.hooks.make.tapAsync('MiniWebpackPlugin', this.try(
      async compilation => {
        console.log(1111111111, 'make')
      }
    ))
    compiler.hooks.afterCompile.tapAsync('MiniWebpackPlugin', this.try(
      async compilation => {
        console.log(1111111111, 'afterCompile')
      }
    ))
    compiler.hooks.shouldEmit.tap('MiniWebpackPlugin', () => {
      console.log(1111111111, 'shouldEmit')
    })
    compiler.hooks.done.tapAsync('MiniWebpackPlugin', this.try(
      async stats => {
        console.log(1111111111, 'done', stats)
      }
    ))
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
    console.log(3333333333, this.entryResources)
    compilation.chunkTemplate.hooks.render.tap('MiniWebpackPlugin', (core, { name }) => {
      if (this.entryResources.indexOf(name) >= 0) {
        console.log(22222222, name)
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
    compilation.mainTemplate.hooks.bootstrap.tap('MiniWebpackPlugin', (source, chunk) => {
      const windowRegExp = new RegExp('window', 'g')
      console.log(4444444444, name)
      if (chunk.name === commonChunkName) {
        return source.replace(windowRegExp, globalVar)
      }
      return source
    })

    // override `require.ensure()`
    compilation.mainTemplate.hooks.requireEnsure.tap(
      'MiniWebpackPlugin',
      () => 'throw new Error("Not chunk loading available");'
    )
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
        const fullPath = this.getFullScriptPath(resource);
        this.addScriptEntry(compiler, fullPath, resource);
      });
  }

  getFullScriptPath(path) {
    const {
      base,
      options: { extensions }
    } = this;
    for (const ext of extensions) {
      const fullPath = resolve(base, path + ext);
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
      });
    });

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

    console.log(66666666666, entryResources, patterns, entries)
    this.addEntries(compiler, entries, assetsChunkName)
  }

  addEntries(compiler, entries, chunkName) {
    compiler.apply(new MultiEntryPlugin(this.base, entries, chunkName));
  }

  async run(compiler) {
    this.entryResources = await this.getEntryResource()
    compiler.hooks.compilation.tap('MinWebpackPlugin', this.toModifyTemplate.bind(this))
    this.compileScripts(compiler)
    await this.compileAssets(compiler)
  }
}

export default MiniWebpackPlugin
