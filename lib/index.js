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
      console.log(4444444444, name);

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