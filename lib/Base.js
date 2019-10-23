"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getBasePath = getBasePath;
exports.setWebpackTarget = setWebpackTarget;
exports.getAppByEntry = getAppByEntry;

var _path = require("path");

var _index = require("./index");

/**
 * function: 获取项目的根路径, 对于小程序是将app.js 当作根路径
 * author  : wq
 * update  : 2019/10/23 17:06
 */
function getBasePath(compiler) {
  const {
    options
  } = compiler;
  const {
    base
  } = options;

  if (base) {
    return (0, _path.resolve)(base);
  }

  const {
    context,
    entry,
    extensions
  } = options;
  let appPath;

  if (!(appPath = getAppByEntry(entry, extensions))) {
    console.warning('entry do not contain app');
    return context;
  } else {
    return (0, _path.dirname)(appPath);
  }
}

function setWebpackTarget(compiler) {
  // 处理编译的目标， 默认是微信
  const {
    options
  } = compiler;
  const {
    target
  } = options;

  if (target !== _index.Targets.Wechat && target !== _index.Targets.Alipay) {
    options.target = _index.Targets.Wechat;
  }

  if (!options.node || options.node.global) {
    options.node = options.node || {};
    options.node.global = false;
  }
} // 获取app.json的入口


function getAppByEntry(entry, extensions) {
  const extRegExpStr = extensions.map(ext => ext.replace(/\./, '\\.')).map(ext => `(${ext})`).join('|');
  const appJSRegExp = new RegExp(`\\bapp(${extRegExpStr})?$`);

  if (typeof entry === 'string') {
    return appJSRegExp.test(entry) ? entry : '';
  }

  if (Array.isArray(entry)) {
    const path = entry.find(item => appJSRegExp.test(item));
    return path || '';
  }

  if (typeof entry === 'object') {
    const path = Object.values(entry).find(item => appJSRegExp.test(item));
    return path || '';
  }

  return '';
}