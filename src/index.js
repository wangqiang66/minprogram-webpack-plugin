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
import { getBasePath, setWebpackTarget } from './MinBase'
import MinOptions from './MinOptions'
import MinProgram from './MinProgram'

export const { Targets } = require('./Targets')

const absoluteExp = /^\//

const stripExt = path => {
  const { dir, name } = parse(path)
  return join(dir, name)
}

class MiniWebpackPlugin extends MinProgram {
  constructor(options) {
    super(options)
    if (MiniWebpackPlugin.inited) {
      throw new Error('minprogram-webpack-plugin 实例化一次就可以了，不支持多次实例化')
    }
    MiniWebpackPlugin.inited = true
    this.options = new MinOptions().process(options)
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
    this.initOptions()
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
    compilation.chunkTemplate.hooks.render.tap('MiniWebpackPlugin', (core, { name }) => {
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
    compilation.mainTemplate.hooks.bootstrap.tap('MiniWebpackPlugin', (source, chunk) => {
      const windowRegExp = new RegExp('window', 'g');
      if (chunk.name === commonChunkName) {
        return source.replace(windowRegExp, globalVar);
      }
      return source;
    });

    // override `require.ensure()`
    compilation.mainTemplate.hooks.requireEnsure.tap(
      'MiniWebpackPlugin',
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

  addScriptEntry(compiler, entry, name) {
    compiler.hooks.make.tapAsync('MiniWebpackPlugin', (compilation, callback) => {
      const dep = SingleEntryPlugin.createDependency(entry, name);
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
      console.log(11111111111, fullPath)
      if (existsSync(fullPath)) {
        console.log(22222222222, fullPath)
        return fullPath
      }
    }
  }

  async compileAssets(compiler) {
    const {
      options: { include, exclude, dot, assetsChunkName, extensions },
      entryResources
    } = this;

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
      .concat(include);

    const entries = await globby(patterns, {
      cwd: this.base,
      nodir: true,
      realpath: true,
      ignore: [...extensions.map(ext => `**/*${ext}`), ...exclude],
      dot
    });

    this.addEntries(compiler, entries, assetsChunkName);
  }

  async run(compiler) {
    this.entryResources = await this.getEntryResource()
    compiler.hooks.compilation.tap('MiniWebpackPlugin', this.toModifyTemplate.bind(this))
    this.compileScripts(compiler)
    await this.compileAssets(compiler)
  }

  addEntries(compiler, entries, chunkName) {
    compiler.apply(new MultiEntryPlugin(this.base, entries, chunkName));
  }
}

export default MiniWebpackPlugin
