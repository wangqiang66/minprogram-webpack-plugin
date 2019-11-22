"use strict";

exports.__esModule = true;
exports.default = _default;

var _xmlLoader = _interopRequireDefault(require("./xml-loader"));

var _sjsLoader = _interopRequireDefault(require("./sjs-loader"));

var _cssLoader = _interopRequireDefault(require("./css-loader"));

var _path = _interopRequireDefault(require("path"));

var _Targets = require("../plugin/Targets");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * function: index
 * author  : wq
 * update  : 2019/11/21 15:05
 */
function _default(source) {
  this.cacheable && this.cacheable();
  const resourcePath = this.resourcePath;
  const xjsName = Object.keys(_Targets.Targets).map(item => _Targets.Targets[item].xjsName);
  const xmlName = Object.keys(_Targets.Targets).map(item => _Targets.Targets[item].xmlName);
  const cssName = Object.keys(_Targets.Targets).map(item => _Targets.Targets[item].cssName);

  const fileExtname = _path.default.extname(resourcePath);

  if (xjsName.indexOf(fileExtname.substring(1)) > -1) {
    return new _sjsLoader.default(this, source);
  } else if (xmlName.indexOf(fileExtname.substring(1)) > -1) {
    return new _xmlLoader.default(this, source);
  } else if (cssName.indexOf(fileExtname.substring(1)) > -1) {
    return new _cssLoader.default(this, source);
  } else {
    return source;
  }
}

module.exports = exports["default"];