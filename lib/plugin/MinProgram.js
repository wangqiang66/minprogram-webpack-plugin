"use strict";

exports.__esModule = true;
exports.default = void 0;

var _path2 = _interopRequireWildcard(require("path"));

var _fsExtra = require("fs-extra");

var _MinBase = require("./MinBase");

var _lodash = require("lodash");

var _MinOptions = _interopRequireDefault(require("./MinOptions"));

var _index = require("./index");

var _sax = _interopRequireDefault(require("sax"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function () { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; if (obj != null) { var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

/**
 * function: 处理小程序的入口
 * author  : wq
 * update  : 2019/10/23 17:45
 */
const AbsolutePathExp = /^\//;
const NotNodeNodulesExp = /^[./]/;
const ROOT_TAG_NAME = 'xxx-wxml-root-xxx';
const ROOT_TAG_START = `<${ROOT_TAG_NAME}>`;
const ROOT_TAG_END = `</${ROOT_TAG_NAME}>`;

class MinProgram {
  constructor(options) {
    this.options = new _MinOptions.default().process(options);
    this.base = '';
  }

  initOptions(compiler) {
    (0, _MinBase.setWebpackTarget)(compiler);
    this.setBase(compiler);
  }

  setBase(compiler) {
    this.base = (0, _MinBase.getBasePath)(compiler, this.options);
  } // 获取文件的路径


  getComponentPagePath(page, root = '') {
    if (AbsolutePathExp.test(page)) {
      page = page.substring(1);
    }

    return _path2.default.posix.join(root, page);
  } // 对此如果存在目录名为node_modules的，可能会出错


  getComponentPageName(path) {
    if (/node_modules/.test(path)) {
      return `node_modules${path.split('node_modules')[1]}`;
    }

    return path;
  } // 获取Page页面中的入口文件


  async getComponentsEntry(components, instance) {
    const {
      usingComponents = {}
    } = (await (0, _fsExtra.readJson)(`${instance}.json`).catch(err => err && err.code !== 'ENOENT' && console.error(err))) || {};
    const basePath = this.base;
    const componentDirPath = (0, _path2.parse)(instance).dir;
    const componentsPath = (0, _lodash.values)(usingComponents);

    for (const componentPath of componentsPath) {
      if (componentPath.indexOf('plugin://') === 0) continue;
      let component = this.getAbsoultePath(componentPath, componentDirPath);

      if (components.findIndex(item => item.component === component) < 0) {
        const entryPath = _path2.default.posix.join(..._path2.default.relative(basePath, component).split(_path2.default.sep));

        components.push({
          component: component,
          name: this.getComponentPageName(entryPath),
          path: entryPath
        });
        await this.getComponentsEntry(components, component);
      }
    }
  }

  getAbsoultePath(_path, currentFileDir) {
    const base = this.base;

    if (!_path2.default.isAbsolute(currentFileDir)) {
      currentFileDir = _path2.default.resolve(base, currentFileDir);
    }

    let finalPath;

    if (!NotNodeNodulesExp.test(_path)) {
      finalPath = (0, _path2.resolve)(base, '../node_modules', _path);
    } else if (AbsolutePathExp.test(_path)) {
      // 组件库中使用/相对的是组件库的目录
      if (/node_modules/.test(currentFileDir)) {
        // 通常打包好的包名是
        const packageName = ['lib', 'packages', 'dist', 'es', 'src'].join('\\\/|\\\/');
        const packageNameExp = new RegExp(`\(\\\/${packageName}\\\/\)`);
        const dir = currentFileDir.split(packageNameExp)[0] + RegExp.$1;
        finalPath = (0, _path2.resolve)(dir, _path.substring(1));
      } else {
        finalPath = (0, _path2.resolve)(base, _path.substring(1));
      }
    } else {
      finalPath = (0, _path2.resolve)(currentFileDir, _path);
    }

    return finalPath;
  } // 获取tabbar的图片


  async getTabBarIcons(tabBar = {}) {
    const tabBarIcons = new Set();
    const tabBarList = tabBar.list || tabBar.items || [];

    for (const tabBarItem of tabBarList) {
      let icon = tabBarItem.iconPath || tabBarItem.icon || '';
      let selectIcon = tabBarItem.selectedIconPath || tabBarItem.activeIcon || '';

      if (icon) {
        tabBarIcons.add(this.getComponentPagePath(icon));
      }

      if (selectIcon) {
        tabBarIcons.add(this.getComponentPagePath(selectIcon));
      }
    }

    this.tabBarIcons = tabBarIcons;
  } // 获取入口文件


  async getEntryResource() {
    const basePath = this.base;
    const appJSONFile = (0, _path2.resolve)(basePath, 'app.json');
    const appJson = await (0, _fsExtra.readJson)(appJSONFile);
    const {
      pages = [],
      tabBar = {}
    } = appJson; // 微信小程序和支付宝小程序的分包命名不一样

    const subpackages = appJson.subpackages || appJson.subPackages || [];
    const componentsEntries = [];
    const pageEntries = []; // forEach 不能用异步await

    for (let page of pages) {
      const entryPath = this.getComponentPagePath(page);
      pageEntries.push({
        name: this.getComponentPageName(entryPath),
        path: entryPath
      });
      await this.getComponentsEntry(componentsEntries, (0, _path2.resolve)(basePath, page));
    } // 处理分包入口


    for (const subpackage of subpackages) {
      const {
        root,
        pages = []
      } = subpackage;
      await Promise.all(pages.map(async page => {
        const entryPath = this.getComponentPagePath(page, root);
        pageEntries.push({
          name: this.getComponentPageName(entryPath),
          path: entryPath
        });
        return this.getComponentsEntry(componentsEntries, (0, _path2.resolve)(basePath, root, page));
      }));
    }

    await this.getTabBarIcons(tabBar);
    return [{
      name: 'app',
      path: 'app'
    }, ...pageEntries, ...componentsEntries];
  } // 获取xml相关的依赖，这里主要是指import-sjs或者微信的wxs或者其他


  async getXMLResource(entries) {
    const targetsTag = Object.keys(_index.Targets).map(item => _index.Targets[item].xjsTag);
    const targetsName = Object.keys(_index.Targets).map(item => `.${_index.Targets[item].xmlName}`);

    for (let i = 0, l = entries.length; i < l; i++) {
      const entry = entries[i];

      const extname = _path2.default.extname(entry);

      if (targetsName.indexOf(extname) > -1) {
        const source = (0, _fsExtra.readFileSync)(`${(0, _path2.resolve)(this.base, entry)}`, 'utf8');
        const xmlContent = `${ROOT_TAG_START}${source}${ROOT_TAG_END}`;

        const parser = _sax.default.parser(false, {
          lowercase: true
        });

        parser.onopentag = ({
          name,
          attributes
        }) => {
          // opened a tag.  node has "name" and "attributes"
          // 使用了wxs
          if (targetsTag.indexOf(name) > -1) {
            const src = attributes.src;
            this.addSJSResource(entries, entry, src);
          }
        };

        parser.write(xmlContent).close();
      }
    }
  }

  addSJSResource(entries, entry, url) {
    const entryPath = this.getAbsoultePath(url, _path2.default.dirname(entry));

    const src = _path2.default.relative(this.base, entryPath).replace(/\\/g, '\/');

    if (entries.indexOf(src) < 0) {
      entries.push(src);
      this.getSJSResource(entries, src);
    }
  } // 获取sjs里面的依赖，这里主要是依赖其他的sjs文件


  async getSJSResource(entries, entry) {
    const source = (0, _fsExtra.readFileSync)(`${(0, _path2.resolve)(this.base, entry)}`, 'utf8');
    const commentRegExp = /(\/\*([\s\S]*?)\*\/|([^:]|^)\/\/(.*)$)/mg;

    function commentReplace(match, multi, multiText, singlePrefix) {
      return singlePrefix || '';
    }

    const removeCommendSource = source.replace(commentRegExp, commentReplace); // 获取里面的依赖 主要是require 和 import表达式

    const importReg = /(?:^|\s|,|;|=)(?:import|require)\s*\(\s*['"]([\w./]+)['"]\s*\)/mg;
    removeCommendSource.replace(importReg, (match, url) => {
      this.addSJSResource(entries, entry, url);
      return match;
    });
  } // 获取acss和wxss相关的依赖


  async getCSSResourceByEntries(entries) {
    const targetsName = Object.keys(_index.Targets).map(item => `.${_index.Targets[item].cssName}`);

    for (let i = 0, l = entries.length; i < l; i++) {
      const entry = entries[i];

      const extname = _path2.default.extname(entry);

      if (targetsName.indexOf(extname) > -1) {
        await this.getCSSResource(entries, entry);
      }
    }
  } // 添加css依赖


  addCSSResource(entries, entry, url) {
    const entryPath = this.getAbsoultePath(url, _path2.default.dirname(entry));

    const src = _path2.default.relative(this.base, entryPath).replace(/\\/g, '\/');

    if (entries.indexOf(src) < 0) {
      entries.push(src);
      this.getCSSResource(entries, src);
    }
  } // 获取单个文件的依赖


  async getCSSResource(entries, entry) {
    const source = (0, _fsExtra.readFileSync)(`${(0, _path2.resolve)(this.base, entry)}`, 'utf8');
    const commentRegExp = /(\/\*([\s\S]*?)\*\/|([^:]|^)\/\/(.*)$)/mg;

    function commentReplace(match, multi, multiText, singlePrefix) {
      return singlePrefix || '';
    }

    const removeCommendSource = source.replace(commentRegExp, commentReplace);
    const importReg = /(?:^|\s)(?:@import)\s*['"]([\w./]+)['"]\s*/mg;
    removeCommendSource.replace(importReg, (match, url) => {
      this.addCSSResource(entries, entry, url);
      return match;
    });
  }

}

exports.default = MinProgram;
module.exports = exports["default"];