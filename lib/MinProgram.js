"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _path = require("path");

var _fsExtra = require("fs-extra");

var _MinBase = require("./MinBase");

var _lodash = require("lodash");

const AbsolutePathExp = /^\//;

class MinProgram {
  constructor() {
    this.base = '';
  }

  initOptions(compiler) {
    (0, _MinBase.setWebpackTarget)(compiler);
    this.setBase(compiler);
  }

  setBase(compiler) {
    this.base = (0, _MinBase.getBasePath)(compiler);
  } // 获取文件的路径


  getComponentPagePath(page) {
    if (AbsolutePathExp.test(page)) {
      page = page.substring(1);
    }

    return page;
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
      } else if (/^[/]/.test(componentPath)) {
        component = (0, _path.resolve)(basePath, componentPath.substring(1));
      } else {
        component = (0, _path.resolve)(componentDirPath, componentPath);
      }

      if (!components.has(component)) {
        components.add((0, _path.relative)(basePath, component).split(_path.sep).join('/'));
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
        if (absoluteExp.test(icon)) {
          icon = icon.substring(1);
        }

        tabBarIcons.add(icon);
      }

      if (selectIcon) {
        if (absoluteExp.test(selectIcon)) {
          selectIcon = selectIcon.substring(1);
        }

        tabBarIcons.add(selectIcon);
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
        pageEntries.add((0, _path.join)(root, this.getComponentPagePath(page)));
        return this.getComponentsEntry(componentsEntries, (0, _path.resolve)(basePath, root, page));
      }));
    }

    await this.getTabBarIcons(tabBar);
    return ['app', ...pageEntries, ...componentsEntries];
  }

}

exports.default = MinProgram;
module.exports = exports["default"];