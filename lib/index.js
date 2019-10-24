"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = exports.Targets = void 0;

var _lodash = require("lodash");

var _fsExtra = require("fs-extra");

var _path = require("path");

var _MultiEntryPlugin = _interopRequireDefault(require("webpack/lib/MultiEntryPlugin"));

var _SingleEntryPlugin = _interopRequireDefault(require("webpack/lib/SingleEntryPlugin"));

var _globby = _interopRequireDefault(require("globby"));

var _MinProgram = _interopRequireDefault(require("./MinProgram"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * function: index
 * author  : wq
 * update  : 2019/10/18 11:23
 */
const {
  Targets
} = require('./Targets');

exports.Targets = Targets;

const stripExt = path => {
  const {
    dir,
    name
  } = (0, _path.parse)(path);
  return (0, _path.join)(dir, name);
};

class MiniWebpackPlugin extends _MinProgram.default {
  constructor(options) {
    if (MiniWebpackPlugin.inited) {
      throw new Error('minprogram-webpack-plugin 实例化一次就可以了，不支持多次实例化');
    }

    MiniWebpackPlugin.inited = true;
    super(options);
  }

  try(handler) {
    return async (arg, callback) => {
      try {
        await handler(arg);
        callback();
      } catch (err) {
        callback(err);
      }
    };
  }

  apply(compiler) {
    this.initOptions(compiler);
    compiler.hooks.run.tapAsync('MiniWebpackPlugin', this.try(async compiler => {
      await this.run(compiler);
    }));
    compiler.hooks.watchRun.tapAsync('MiniWebpackPlugin', this.try(async compiler => {
      await this.run(compiler.compiler);
    }));
    compiler.hooks.emit.tapAsync('MiniWebpackPlugin', this.try(async compilation => {
      // console.log(1111111111, 'emit');
      await this.toEmitTabBarIcons(compilation);
    }));
    compiler.hooks.afterEmit.tapAsync('MiniWebpackPlugin', this.try(async compilation => {
      // console.log(1111111111, 'afterEmit');
      await this.toAddTabBarIconsDependencies(compilation);
    }));
    // compiler.hooks.entryOption.tap('MiniWebpackPlugin', () => {
    //   console.log(1111111111, 'entryOption');
    // });
    // compiler.hooks.afterPlugins.tap('MiniWebpackPlugin', compiler => {
    //   console.log(1111111111, 'afterPlugins');
    // });
    // compiler.hooks.afterResolvers.tap('MiniWebpackPlugin', compiler => {
    //   console.log(1111111111, 'afterResolvers');
    // });
    // compiler.hooks.environment.tap('MiniWebpackPlugin', () => {
    //   console.log(1111111111, 'environment');
    // });
    // compiler.hooks.afterEnvironment.tap('MiniWebpackPlugin', () => {
    //   console.log(1111111111, 'afterEnvironment');
    // });
    // compiler.hooks.normalModuleFactory.tap('MiniWebpackPlugin', () => {
    //   console.log(1111111111, 'normalModuleFactory');
    // });
    // compiler.hooks.contextModuleFactory.tap('MiniWebpackPlugin', () => {
    //   console.log(1111111111, 'contextModuleFactory');
    // });
    // compiler.hooks.beforeCompile.tapAsync('MiniWebpackPlugin', this.try(async compilationParams => {
    //   console.log(1111111111, 'beforeCompile');
    // }));
    // compiler.hooks.thisCompilation.tap('MiniWebpackPlugin', (compilation) => {
    //   // console.log(222222222, compilation)
    //   compilation.hooks.buildModule.tap('MiniWebpackPlugin', () => {
    //     console.log(2222222222, 'buildModule')
    //   })
    //   compilation.hooks.rebuildModule.tap('MiniWebpackPlugin', () => {
    //     console.log(2222222222, 'rebuildModule')
    //   })
    //   compilation.hooks.failedModule.tap('MiniWebpackPlugin', () => {
    //     console.log(2222222222, 'failedModule')
    //   })
    //   compilation.hooks.succeedModule.tap('MiniWebpackPlugin', () => {
    //     console.log(2222222222, 'succeedModule')
    //   })
    //   compilation.hooks.finishModules.tap('MiniWebpackPlugin', () => {
    //     console.log(2222222222, 'finishModules')
    //   })
    //   compilation.hooks.finishRebuildingModule.tap('MiniWebpackPlugin', () => {
    //     console.log(2222222222, 'finishRebuildingModule')
    //   })
    //   compilation.hooks.seal.tap('MiniWebpackPlugin', () => {
    //     console.log(2222222222, 'seal')
    //   })
    //   compilation.hooks.unseal.tap('MiniWebpackPlugin', () => {
    //     console.log(2222222222, 'unseal')
    //   })
    //   compilation.hooks.optimizeDependenciesBasic.tap('MiniWebpackPlugin', () => {
    //     console.log(2222222222, 'optimizeDependenciesBasic')
    //   })
    //   compilation.hooks.optimizeDependencies.tap('MiniWebpackPlugin', () => {
    //     console.log(2222222222, 'optimizeDependencies')
    //   })
    //   compilation.hooks.optimizeDependenciesAdvanced.tap('MiniWebpackPlugin', () => {
    //     console.log(2222222222, 'optimizeDependenciesAdvanced')
    //   })
    //   compilation.hooks.afterOptimizeDependencies.tap('MiniWebpackPlugin', () => {
    //     console.log(2222222222, 'afterOptimizeDependencies')
    //   })
    //   compilation.hooks.optimize.tap('MiniWebpackPlugin', () => {
    //     console.log(2222222222, 'optimize')
    //   })
    //   compilation.hooks.optimizeModulesBasic.tap('MiniWebpackPlugin', (modules) => {
    //     console.log(2222222222, 'optimizeModulesBasic')
    //   })
    //   compilation.hooks.optimizeModules.tap('MiniWebpackPlugin', (modules) => {
    //     console.log(2222222222, 'optimizeModules')
    //   })
    //   compilation.hooks.optimizeModulesBasic.tap('MiniWebpackPlugin', (modules) => {
    //     console.log(2222222222, 'optimizeModulesBasic')
    //   })
    //   compilation.hooks.optimizeModulesAdvanced.tap('MiniWebpackPlugin', (modules) => {
    //     console.log(2222222222, 'optimizeModulesAdvanced')
    //   })
    //   compilation.hooks.afterOptimizeModules.tap('MiniWebpackPlugin', (modules) => {
    //     console.log(2222222222, 'afterOptimizeModules')
    //   })
    //   compilation.hooks.optimizeChunksBasic.tap('MiniWebpackPlugin', (chunks) => {
    //     console.log(2222222222, 'optimizeChunksBasic')
    //   })
    //   compilation.hooks.optimizeChunks.tap('MiniWebpackPlugin', (chunks) => {
    //     console.log(2222222222, 'optimizeChunks')
    //   })
    //   compilation.hooks.optimizeChunksAdvanced.tap('MiniWebpackPlugin', (chunks) => {
    //     console.log(2222222222, 'optimizeChunksAdvanced')
    //   })
    //   compilation.hooks.afterOptimizeChunks.tap('MiniWebpackPlugin', () => {
    //     console.log(2222222222, 'afterOptimizeChunks')
    //   })
    //   compilation.hooks.optimizeTree.tapAsync('MiniWebpackPlugin', async (chunks, modules, callback) => {
    //     console.log(2222222222, 'optimizeTree')
    //     callback()
    //   })
    //   compilation.hooks.afterOptimizeTree.tap('MiniWebpackPlugin', () => {
    //     console.log(2222222222, 'afterOptimizeTree')
    //   })
    //   compilation.hooks.optimizeChunkModulesBasic.tap('MiniWebpackPlugin', () => {
    //     console.log(2222222222, 'optimizeChunkModulesBasic')
    //   })
    //   compilation.hooks.optimizeChunkModules.tap('MiniWebpackPlugin', () => {
    //     console.log(2222222222, 'optimizeChunkModules')
    //   })
    //   compilation.hooks.optimizeChunkModulesAdvanced.tap('MiniWebpackPlugin', () => {
    //     console.log(2222222222, 'optimizeChunkModulesAdvanced')
    //   })
    //   compilation.hooks.afterOptimizeChunkModules.tap('MiniWebpackPlugin', () => {
    //     console.log(2222222222, 'afterOptimizeChunkModules')
    //   })
    //   compilation.hooks.shouldRecord.tap('MiniWebpackPlugin', () => {
    //     console.log(2222222222, 'shouldRecord')
    //   })
    //   compilation.hooks.reviveModules.tap('MiniWebpackPlugin', () => {
    //     console.log(2222222222, 'reviveModules')
    //   })
    //   compilation.hooks.optimizeModuleOrder.tap('MiniWebpackPlugin', () => {
    //     console.log(2222222222, 'optimizeModuleOrder')
    //   })
    //   compilation.hooks.advancedOptimizeModuleOrder.tap('MiniWebpackPlugin', () => {
    //     console.log(2222222222, 'advancedOptimizeModuleOrder')
    //   })
    //   compilation.hooks.beforeModuleIds.tap('MiniWebpackPlugin', () => {
    //     console.log(2222222222, 'beforeModuleIds')
    //   })
    //   compilation.hooks.moduleIds.tap('MiniWebpackPlugin', () => {
    //     console.log(2222222222, 'moduleIds')
    //   })
    //   compilation.hooks.optimizeModuleIds.tap('MiniWebpackPlugin', () => {
    //     console.log(2222222222, 'optimizeModuleIds')
    //   })
    //   compilation.hooks.afterOptimizeModuleIds.tap('MiniWebpackPlugin', () => {
    //     console.log(2222222222, 'afterOptimizeModuleIds')
    //   })
    //   compilation.hooks.reviveChunks.tap('MiniWebpackPlugin', () => {
    //     console.log(2222222222, 'reviveChunks')
    //   })
    //   compilation.hooks.optimizeChunkOrder.tap('MiniWebpackPlugin', () => {
    //     console.log(2222222222, 'optimizeChunkOrder')
    //   })
    //   // compilation.hooks.beforeOptimizeChunkIds.tap('MiniWebpackPlugin', () => {
    //   //   console.log(2222222222, 'beforeOptimizeChunkIds')
    //   // })
    //   compilation.hooks.optimizeChunkIds.tap('MiniWebpackPlugin', () => {
    //     console.log(2222222222, 'optimizeChunkIds')
    //   })
    //   compilation.hooks.afterOptimizeChunkIds.tap('MiniWebpackPlugin', () => {
    //     console.log(2222222222, 'afterOptimizeChunkIds')
    //   })
    //   compilation.hooks.recordModules.tap('MiniWebpackPlugin', () => {
    //     console.log(2222222222, 'recordModules')
    //   })
    //   compilation.hooks.recordChunks.tap('MiniWebpackPlugin', () => {
    //     console.log(2222222222, 'recordChunks')
    //   })
    //   compilation.hooks.beforeHash.tap('MiniWebpackPlugin', () => {
    //     console.log(2222222222, 'beforeHash')
    //   })
    //   compilation.hooks.afterHash.tap('MiniWebpackPlugin', () => {
    //     console.log(2222222222, 'afterHash')
    //   })
    //   compilation.hooks.recordHash.tap('MiniWebpackPlugin', () => {
    //     console.log(2222222222, 'recordHash')
    //   })
    //   compilation.hooks.record.tap('MiniWebpackPlugin', () => {
    //     console.log(2222222222, 'record')
    //   })
    //   compilation.hooks.beforeModuleAssets.tap('MiniWebpackPlugin', () => {
    //     console.log(2222222222, 'beforeModuleAssets')
    //   })
    //   compilation.hooks.shouldGenerateChunkAssets.tap('MiniWebpackPlugin', () => {
    //     console.log(2222222222, 'shouldGenerateChunkAssets')
    //   })
    //   compilation.hooks.beforeChunkAssets.tap('MiniWebpackPlugin', () => {
    //     console.log(2222222222, 'beforeChunkAssets')
    //   })
    //   compilation.hooks.additionalChunkAssets.tap('MiniWebpackPlugin', () => {
    //     console.log(2222222222, 'additionalChunkAssets')
    //   })
    //   // compilation.hooks.records.tap('MiniWebpackPlugin', () => {
    //   //   console.log(2222222222, 'records')
    //   // })
    //   compilation.hooks.additionalAssets.tapAsync('MiniWebpackPlugin', (callback) => {
    //     console.log(2222222222, 'additionalAssets')
    //     callback()
    //   })
    //   compilation.hooks.optimizeChunkAssets.tapAsync('MiniWebpackPlugin', this.try(async (chunks) => {
    //     console.log(2222222222, 'optimizeChunkAssets')
    //   }))
    //   compilation.hooks.afterOptimizeChunkAssets.tap('MiniWebpackPlugin', () => {
    //     console.log(2222222222, 'afterOptimizeChunkAssets')
    //   })
    //   compilation.hooks.optimizeAssets.tapAsync('MiniWebpackPlugin', this.try(async (assets) => {
    //     console.log(2222222222, 'optimizeAssets')
    //   }))
    //   compilation.hooks.afterOptimizeAssets.tap('MiniWebpackPlugin', () => {
    //     console.log(2222222222, 'afterOptimizeAssets')
    //   })
    //   compilation.hooks.needAdditionalSeal.tap('MiniWebpackPlugin', () => {
    //     console.log(2222222222, 'needAdditionalSeal')
    //   })
    //   compilation.hooks.afterSeal.tapAsync('MiniWebpackPlugin', (callback) => {
    //     console.log(2222222222, 'afterSeal')
    //     callback()
    //   })
    //   compilation.hooks.chunkHash.tap('MiniWebpackPlugin', () => {
    //     console.log(2222222222, 'chunkHash')
    //   })
    //   compilation.hooks.moduleAsset.tap('MiniWebpackPlugin', () => {
    //     console.log(2222222222, 'moduleAsset')
    //   })
    //   compilation.hooks.chunkAsset.tap('MiniWebpackPlugin', () => {
    //     console.log(2222222222, 'chunkAsset')
    //   })
    //   compilation.hooks.assetPath.tap('MiniWebpackPlugin', () => {
    //     console.log(2222222222, 'assetPath')
    //   })
    //   compilation.hooks.needAdditionalPass.tap('MiniWebpackPlugin', () => {
    //     console.log(2222222222, 'needAdditionalPass')
    //   })
    //   compilation.hooks.childCompiler.tap('MiniWebpackPlugin', () => {
    //     console.log(2222222222, 'childCompiler')
    //   })
    //   compilation.hooks.normalModuleLoader.tap('MiniWebpackPlugin', () => {
    //     console.log(2222222222, 'normalModuleLoader')
    //   })
    //   compilation.hooks.dependencyReference.tap('MiniWebpackPlugin', () => {
    //     console.log(2222222222, 'dependencyReference')
    //   })
    //   console.log(1111111111, 'thisCompilation');
    // });
    // compiler.hooks.compilation.tap('MiniWebpackPlugin', () => {
    //   console.log(1111111111, 'compilation');
    // });
    // compiler.hooks.make.tapAsync('MiniWebpackPlugin', this.try(async compilation => {
    //   console.log(1111111111, 'make');
    // }));
    // compiler.hooks.afterCompile.tapAsync('MiniWebpackPlugin', this.try(async compilation => {
    //   console.log(1111111111, 'afterCompile');
    // }));
    // compiler.hooks.shouldEmit.tap('MiniWebpackPlugin', () => {
    //   console.log(1111111111, 'shouldEmit')
    // });
    compiler.hooks.done.tapAsync('MiniWebpackPlugin', this.try(async stats => {
      console.log(1111111111, 'done')
    }))
  }

  async toEmitTabBarIcons(compilation) {
    const emitIcons = [];
    const basePath = this.base;
    this.tabBarIcons.forEach(iconPath => {
      const iconSrc = (0, _path.resolve)(basePath, iconPath);

      const toEmitIcon = async () => {
        const iconStat = (0, _fsExtra.stat)(iconSrc);
        const iconSource = await (0, _fsExtra.readFile)(iconSrc);
        compilation.assets[iconPath] = {
          size: () => iconStat.size,
          source: () => iconSource
        };
      };

      emitIcons.push(toEmitIcon());
    });
    await Promise.all(emitIcons);
  }

  toAddTabBarIconsDependencies(compilation) {
    const {
      fileDependencies
    } = compilation;
    this.tabBarIcons.forEach(iconPath => {
      if (!~fileDependencies.indexOf(iconPath)) {
        fileDependencies.push(iconPath);
      }
    });
  } // 修改模板


  toModifyTemplate(compilation) {
    const {
      commonModuleName
    } = this.options;
    const {
      target
    } = compilation.options;
    const commonChunkName = stripExt(commonModuleName);
    const globalVar = target.name === 'Alipay' ? 'my' : 'wx'; // inject chunk entries

    console.log(3333333333, this.entryResources);
    compilation.chunkTemplate.hooks.render.tap('MiniWebpackPlugin', (core, {
      name
    }) => {
      if (this.entryResources.indexOf(name) >= 0) {
        console.log(22222222, name);
        const relativePath = (0, _path.relative)((0, _path.dirname)(name), `./${commonModuleName}`);
        const posixPath = relativePath.replace(/\\/g, '/');
        const source = core.source(); // eslint-disable-next-line max-len

        const injectContent = `; function webpackJsonp() { require("./${posixPath}"); ${globalVar}.webpackJsonp.apply(null, arguments); }`;

        if (source.indexOf(injectContent) < 0) {
          const concatSource = new ConcatSource(core);
          concatSource.add(injectContent);
          return concatSource;
        }
      }

      return core;
    }); // replace `window` to `global` in common chunk

    compilation.mainTemplate.hooks.bootstrap.tap('MiniWebpackPlugin', (source, chunk) => {
      const windowRegExp = new RegExp('window', 'g');

      if (chunk.name === commonChunkName) {
        return source.replace(windowRegExp, globalVar);
      }

      return source;
    }); // override `require.ensure()`

    compilation.mainTemplate.hooks.requireEnsure.tap('MiniWebpackPlugin', () => 'throw new Error("Not chunk loading available");');
  }

  addScriptEntry(compiler, entry, name) {
    compiler.hooks.make.tapAsync('MiniWebpackPlugin', (compilation, callback) => {
      const dep = _SingleEntryPlugin.default.createDependency(entry, name);

      compilation.addEntry(this.base, dep, name, callback);
    });
  }

  compileScripts(compiler) {
    // this.applyCommonsChunk(compiler);
    this.entryResources.filter(resource => resource !== 'app').forEach(resource => {
      const fullPath = this.getFullScriptPath(resource);
      this.addScriptEntry(compiler, fullPath, resource);
    });
  }

  getFullScriptPath(path) {
    const {
      base,
      options: {
        extensions
      }
    } = this;

    for (const ext of extensions) {
      const fullPath = (0, _path.resolve)(base, path + ext);

      if ((0, _fsExtra.existsSync)(fullPath)) {
        return fullPath;
      }
    }
  }

  async compileAssets(compiler) {
    const {
      options: {
        include,
        exclude,
        dot,
        assetsChunkName,
        extensions
      },
      entryResources
    } = this;
    compiler.hooks.compilation.tap('MiniWebpackPlugin', compilation => {
      compilation.hooks.beforeChunkAssets.tap('MiniWebpackPlugin', () => {
        const assetsChunkIndex = compilation.chunks.findIndex(({
          name
        }) => name === assetsChunkName);

        if (assetsChunkIndex > -1) {
          compilation.chunks.splice(assetsChunkIndex, 1);
        }
      });
    });
    const patterns = entryResources.map(resource => `${resource}.*`).concat(include);
    const entries = await (0, _globby.default)(patterns, {
      cwd: this.base,
      nodir: true,
      realpath: true,
      ignore: [...extensions.map(ext => `**/*${ext}`), ...exclude],
      dot
    });
    console.log(66666666666, entryResources, patterns, entries);
    this.addEntries(compiler, entries, assetsChunkName);
  }

  addEntries(compiler, entries, chunkName) {
    compiler.apply(new _MultiEntryPlugin.default(this.base, entries, chunkName));
  }

  async run(compiler) {
    this.entryResources = await this.getEntryResource();
    compiler.hooks.compilation.tap('MinWebpackPlugin', this.toModifyTemplate.bind(this));
    this.compileScripts(compiler);
    await this.compileAssets(compiler);
  }

}

var _default = MiniWebpackPlugin;
exports.default = _default;
