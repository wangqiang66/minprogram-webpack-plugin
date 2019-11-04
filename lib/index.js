"use strict";

exports.__esModule = true;
exports.default = exports.Targets = void 0;

var _lodash = require("lodash");

var _fsExtra = _interopRequireWildcard(require("fs-extra"));

var _path = _interopRequireWildcard(require("path"));

var _MultiEntryPlugin = _interopRequireDefault(require("webpack/lib/MultiEntryPlugin"));

var _SingleEntryPlugin = _interopRequireDefault(require("webpack/lib/SingleEntryPlugin"));

var _webpackSources = require("webpack-sources");

var _webpack = require("webpack");

var _globby = _interopRequireDefault(require("globby"));

var _MinProgram = _interopRequireDefault(require("./MinProgram"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function () { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; if (obj != null) { var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

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
    return async function (...args) {
      const arg = args.slice(0, args.length - 1);
      const callback = args[args.length - 1];

      try {
        await handler(...arg);
        callback();
      } catch (err) {
        callback(err);
      }
    };
  }

  async apply(compiler) {
    this.initOptions(compiler);
    compiler.hooks.environment.tap('MiniWebpackPlugin', () => {
      this.prepareEnvironment(compiler);
    });
    compiler.hooks.compilation.tap('MiniWebpackPlugin', this.setCompilation.bind(this));
    compiler.hooks.run.tapAsync('MiniWebpackPlugin', this.try(async compiler => {
      await this.run(compiler);
    }));
    compiler.hooks.watchRun.tapAsync('MiniWebpackPlugin', this.try(async compiler => {
      await this.run(compiler);
    }));
    compiler.hooks.emit.tapAsync('MiniWebpackPlugin', this.try(async compilation => {
      await this.toEmitTabBarIcons(compilation);
    }));
    compiler.hooks.afterEmit.tapAsync('MiniWebpackPlugin', this.try(async compilation => {
      await this.toAddTabBarIconsDependencies(compilation);
    }));
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
  }

  addScriptEntry(compiler, entry, name) {
    compiler.hooks.make.tapAsync('MiniWebpackPlugin', (compilation, callback) => {
      const dep = _SingleEntryPlugin.default.createDependency(entry, name);

      compilation.addEntry(this.base, dep, name, callback);
    });
  }

  compileScripts(compiler) {
    this.entryResources.filter(({
      name
    }) => name !== 'app').forEach(({
      path,
      name
    }) => {
      const fullPath = this.getFullScriptPath(path);
      this.addScriptEntry(compiler, fullPath, name);
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
    const patterns = entryResources.map(resource => `${resource.path}.*`).concat(include);
    const entries = await (0, _globby.default)(patterns, {
      cwd: this.base,
      nodir: true,
      realpath: true,
      ignore: [...extensions.map(ext => `**/*${ext}`), ...exclude],
      dot
    });

    if (compiler.options.target.name === Targets.Wechat.name) {
      entries.unshift('project.config.json');
    }

    this.addEntries(compiler, entries, assetsChunkName);
  }

  addEntries(compiler, entries, chunkName) {
    compiler.apply(new _MultiEntryPlugin.default(this.base, entries, chunkName));
  } // 处理compilation


  setCompilation(compilation) {
    const {
      commonModuleName,
      assetsChunkName,
      definedSplitChunk
    } = this.options;
    const commonChunkName = stripExt(commonModuleName); // 删除__assets_chunk_name__ 这个入口的打包文件，不需要打包出来

    compilation.hooks.beforeChunkAssets.tap('MinWebpackPlugin', () => {
      const assetsChunkIndex = compilation.chunks.findIndex(({
        name
      }) => name === assetsChunkName);

      if (assetsChunkIndex > -1) {
        compilation.chunks.splice(assetsChunkIndex, 1);
      }
    });
    compilation.mainTemplate.hooks.render.tap('MinWebpackPlugin', (source, chunk, hash, moduleTemplate, dependencyTemplates) => {
      const entryResources = this.entryResources;

      if (entryResources.findIndex(({
        name
      }) => name === chunk.name) > -1) {
        const source = new _webpackSources.ConcatSource();
        const globalRequire = 'require';
        let webpackRequire = `${globalRequire}("${_path.default.posix.relative(`${chunk.name}`, `webpack-require.js`)}")`.replace('../', './');
        source.add(`var webpackRequire = ${webpackRequire};\n`);

        if (definedSplitChunk) {
          const commonChunks = Array.from(chunk.entryModule._chunks);
          commonChunks.map(commonChunkItem => {
            const commonRequire = `${globalRequire}("${_path.default.posix.relative(`${chunk.name}`, `${commonChunkItem.name}.js`)}")`.replace('../', './');
            source.add(`var ${commonChunkItem.name} = ${commonRequire};\n`);
          });
        } else {
          const commonRequire = `${globalRequire}("${_path.default.posix.relative(`${chunk.name}`, `${commonChunkName}.js`)}")`.replace('../', './');
          source.add(`var ${commonChunkName} = ${commonRequire};\n`);
        }

        source.add(`webpackRequire(`);
        source.add(`${JSON.stringify(chunk.entryModule.id)}, `);

        if (definedSplitChunk) {
          const commonChunks = Array.from(chunk.entryModule._chunks);
          source.add(`${commonChunkName}`, Object.assign(...commonChunks.map(commonChunkItem => commonChunkItem.name)));
        } else {
          source.add(`${commonChunkName}`);
        } // source.add(compilation.mainTemplate.hooks.modules.call(
        //   new RawSource(""),
        //   chunk,
        //   hash,
        //   moduleTemplate,
        //   dependencyTemplates
        // ))


        source.add(`)`);
        return source;
      }

      return source;
    });
    compilation.chunkTemplate.hooks.render.tap('MinWebpackPlugin', (module, chunk, moduleTemplate, dependencyTemplates) => {
      const moduleSources = _webpack.Template.renderChunkModules(chunk, m => typeof m.source === "function", moduleTemplate, dependencyTemplates);

      const core = compilation.chunkTemplate.hooks.modules.call(moduleSources, chunk, moduleTemplate, dependencyTemplates);
      const source = new _webpackSources.ConcatSource();
      source.add(`module.exports = `);
      source.add(core);
      return source;
    });
    compilation.hooks.additionalAssets.tapAsync('MiniPlugin', callback => {
      compilation.assets['webpack-require.js'] = new _webpackSources.ConcatSource(_fsExtra.default.readFileSync((0, _path.join)(__dirname, './lib/require.js'), 'utf8'));
      callback();
    });
  } // 对打包前的环境处理


  prepareEnvironment(compiler) {
    this.setOutputParams(compiler);
    this.setCommonSplitChunk(compiler);
  } // 处理output


  setOutputParams(compiler) {
    const {
      target
    } = compiler.options;
    const globalVar = Targets[target.name].global;
    compiler.options.output.libraryTarget = 'var';
    compiler.options.output.globalObject = globalVar;
  } // 处理公共部分提取


  setCommonSplitChunk(compiler) {
    const {
      commonModuleName,
      definedSplitChunk
    } = this.options;
    const commonChunkName = stripExt(commonModuleName);

    if (!definedSplitChunk) {
      compiler.options.optimization.splitChunks.cacheGroups[commonChunkName] = {
        name: commonChunkName,
        chunks: chunk => {
          const ext = _path.default.extname(chunk.entryModule.resource || '');

          return ext === '.js';
        },
        minSize: 1,
        priority: 0
      };
    }
  }

  async run(compiler) {
    this.entryResources = await this.getEntryResource();
    this.compileScripts(compiler);
    await this.compileAssets(compiler);
  }

}

var _default = MiniWebpackPlugin;
exports.default = _default;