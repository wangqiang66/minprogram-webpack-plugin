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

var _utils = _interopRequireDefault(require("./utils"));

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
const DEPS_MAP = {};

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
    })); // compiler.hooks.afterCompile.tapAsync('MiniWebpackPlugin',
    //   this.try(
    //     async compilation => {
    //       console.log(44444444444, 'afterCompile', compilation)
    //     }
    //   ))
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
      const dep = _SingleEntryPlugin.default.createDependency(entry, name); // console.log(111111111, dep)


      compilation.addEntry(this.base, dep, name, callback);
    });
  }

  compileScripts(compiler) {
    // this.applyCommonsChunk(compiler);
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
    this.addEntries(compiler, entries, assetsChunkName);
  }

  addEntries(compiler, entries, chunkName) {
    compiler.apply(new _MultiEntryPlugin.default(this.base, entries, chunkName));
  } // 处理compilation


  setCompilation(compilation) {
    const {
      commonModuleName,
      assetsChunkName
    } = this.options;
    const {
      target
    } = compilation.options;
    const commonChunkName = stripExt(commonModuleName);
    const globalVar = Targets[target.name].global; // 删除__assets_chunk_name__ 这个入口的打包文件，不需要打包出来

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
        let common = `${globalRequire}("${_path.default.posix.relative(`${chunk.name}`, `common.js`)}")`.replace('../', './');
        source.add(`var webpackRequire = ${webpackRequire};\n`);
        source.add(`var common = ${common};\n`);
        source.add(`webpackRequire(`);
        source.add(`${JSON.stringify(chunk.entryModule.id)}, `);
        source.add('common')
        // source.add(compilation.mainTemplate.hooks.modules.call(new _webpackSources.RawSource(""), chunk, hash, moduleTemplate, dependencyTemplates));
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
  }

  getChunkResourceRegExp() {
    if (this._chunkResourceRegex) {
      return this._chunkResourceRegex;
    }

    const {
      options: {
        extensions
      }
    } = this;
    const exts = extensions.map(ext => ext.replace(/\./g, '\\.')).map(ext => `(${ext}$)`).join('|');
    return new RegExp(exts);
  }

  async run(compiler) {
    this.entryResources = await this.getEntryResource();
    this.compileScripts(compiler);
    await this.compileAssets(compiler);
  }

}

var _default = MiniWebpackPlugin;
exports.default = _default;
