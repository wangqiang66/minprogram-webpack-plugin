"use strict";

exports.__esModule = true;
exports.default = void 0;

var _path = _interopRequireWildcard(require("path"));

var _fsExtra = require("fs-extra");

var _MinBase = require("./MinBase");

var _lodash = require("lodash");

var _MinOptions = _interopRequireDefault(require("./MinOptions"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function () { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; if (obj != null) { var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

const AbsolutePathExp = /^\//;

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

    return _path.default.posix.join(root, page);
  } // 获取Page页面中的入口文件


  async getComponentsEntry(components, instance) {
    const {
      usingComponents = {}
    } = (await (0, _fsExtra.readJson)(`${instance}.json`).catch(err => err && err.code !== 'ENOENT' && console.error(err))) || {};
    const basePath = this.base;
    const componentDirPath = (0, _path.parse)(instance).dir;
    const componentsPath = (0, _lodash.values)(usingComponents);

    for (const componentPath of componentsPath) {
      if (componentPath.indexOf('plugin://') === 0) continue;
      let component;

      if (!/^[./]/.test(componentPath)) {
        component = (0, _path.resolve)(basePath, '../node_modules', componentPath);
      } else if (AbsolutePathExp.test(componentPath)) {
        if (/node_modules/.test(componentDirPath)) {
          // 通常打包好的包名是
          const packageName = ['lib', 'packages', 'dist', 'es', 'src'].join('\\\/|\\\/');
          const packageNameExp = new RegExp(`\(\\\/${packageName}\\\/\)`);
          const dir = componentDirPath.split(packageNameExp)[0] + RegExp.$1;
          component = (0, _path.resolve)(dir, componentPath.substring(1));
        } else {
          component = (0, _path.resolve)(basePath, componentPath.substring(1));
        }
      } else {
        component = (0, _path.resolve)(componentDirPath, componentPath);
      }

      if (!components.has(component)) {
        components.add(_path.default.posix.join(..._path.default.relative(basePath, component).split(_path.default.sep)));
        await this.getComponentsEntry(components, component);
      }
    }
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
    const appJSONFile = (0, _path.resolve)(basePath, 'app.json');
    const appJson = await (0, _fsExtra.readJson)(appJSONFile);
    const {
      pages = [],
      tabBar = {}
    } = appJson; // 微信小程序和支付宝小程序的分包命名不一样

    const subpackages = appJson.subpackages || appJson.subPackages || [];
    const componentsEntries = new Set();
    const pageEntries = new Set(); // forEach 不能用异步await

    for (let page of pages) {
      pageEntries.add(this.getComponentPagePath(page));
      await this.getComponentsEntry(componentsEntries, (0, _path.resolve)(basePath, page));
    } // 处理分包入口


    for (const subpackage of subpackages) {
      const {
        root,
        pages = []
      } = subpackage;
      await Promise.all(pages.map(async page => {
        pageEntries.add(this.getComponentPagePath(page, root));
        return this.getComponentsEntry(componentsEntries, (0, _path.resolve)(basePath, root, page));
      }));
    }

    await this.getTabBarIcons(tabBar);
    return ['app', ...pageEntries, ...componentsEntries];
  }

}

exports.default = MinProgram;
module.exports = exports["default"];