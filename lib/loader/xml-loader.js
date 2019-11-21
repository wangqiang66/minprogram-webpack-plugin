"use strict";

exports.__esModule = true;
exports.default = _default;

var _Targets = require("../plugin/Targets");

var _sax = _interopRequireDefault(require("sax"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * function: 处理小程序中的wxml转换
 * author  : wq
 * update  : 2019/11/19 15:41
 */
const ROOT_TAG_NAME = 'xxx-wxml-root-xxx';
const ROOT_TAG_START = `<${ROOT_TAG_NAME}>`;
const ROOT_TAG_END = `</${ROOT_TAG_NAME}>`;
const ROOT_TAG_LENGTH = ROOT_TAG_START.length;

class MiniXMLLoader {
  constructor(loader, source) {
    this.loader = loader;
    this.source = source;
    this.callback = loader.async();
    this.context = loader.context;
    const target = _Targets.Targets[loader._compilation.options.target.name];

    if (!target) {
      throw new Error('该loader需要和minprogram-webpack-plugin 一起使用');
    }

    this.target = target;
    this.parser();
  }

  parser() {
    // 暂时不做这么复杂，只进行wxs和wx: bind相关的转换, 后期复杂的请求可以尝试转换成语法树
    let content = this.source;
    content = this.transformTag(content);
    content = this.transformAttribute(content);
    content = this.transformEvent(content);
    content = this.transformEventPrevent(content);
    console.log(11111111, content);
    this.callback(null, content); // const xmlContent = `${ROOT_TAG_START}${content}${ROOT_TAG_END}`
    // const parser = sax.parser(false, { lowercase: true })
    // const wxsArray = Object.keys(Targets).map(item => Targets[item].xjsTag)
    // const xmlAttr = Object.keys(Targets).map(item => Targets[item].xmlAttr)
    // const xmlEvent = Object.keys(Targets).map(item => Targets[item].xmlEvent)
    // const xmlEventPrevent = Object.keys(Targets).map(item => Targets[item].xmlEventPrevent)
    // const xmlAttrExp = new RegExp(`^(?:${xmlAttr.join('|')})`)
    // const xmlEventExp = new RegExp(`^(?:${xmlEvent.join('|')})`)
    // const xmlEventPreventExp = new RegExp(`^(?:${xmlEventPrevent.join('|')})`)
    // const target = this.target
    // const currentAttrExp = new RegExp(`^${target.xmlAttr}`)
    // const currentEventExp = new RegExp(`^${target.xmlEvent}`)
    // const currentEventPreventExp = new RegExp(`^${target.xmlEventPrevent}`)
    // const replaceArray = []
    // const xmlTax = []
    // let currentPosition = []
    // // 替换标签
    // parser.onopentagstart = function ({ name }) {
    //   let tag = name
    //   // opened a tag.  node has "name" and "attributes"
    //   // 使用了wxs 这里只是对wxs标签进行替换
    //   if (wxsArray.indexOf(name) > -1) {
    //     if (target.xjsTag !== name) {
    //       const endIndex = parser.position - ROOT_TAG_LENGTH
    //       const startIndex = endIndex - name.length
    //       replaceArray.push({
    //         startIndex,
    //         endIndex,
    //         content: target.xjsTag
    //       })
    //     }
    //   }
    //   xmlTax.push({
    //     tag: tag,
    //     type: 0,
    //     attribute:
    //   })
    // }
    //
    // parser.ontext = function (value) {
    //   // opened a tag.  node has "name" and "attributes"
    //   // 使用了wxs
    //   console.log(55555555, value, parser.position)
    // }
    //
    // parser.onclosetag = function (name) {
    //   // opened a tag.  node has "name" and "attributes"
    //   // 使用了wxs
    //   console.log(222222, name, parser.position)
    //   if (wxsArray.indexOf(name) > -1) {
    //     if (target.xjsTag !== name) {
    //       const endIndex = parser.position - ROOT_TAG_LENGTH
    //       const startIndex = endIndex - name.length
    //       replaceArray.push({
    //         startIndex,
    //         endIndex,
    //         content: target.xjsTag
    //       })
    //     }
    //   }
    // }
    //
    // // 替换属性
    // parser.onattribute = ({ name, value }) => {
    //   // 替换wx
    //   console.log(11111, parser.position, name, value)
    //   if (xmlAttrExp.test(name)) {
    //     if (!currentAttrExp.test(name)) {
    //       const endIndex = parser.position - ROOT_TAG_LENGTH
    //       const startIndex = endIndex - value.length
    //       replaceArray.push({
    //         startIndex,
    //         endIndex,
    //         content: target.xjsTag
    //       })
    //     }
    //   }
    // }
    //
    // parser.onend = async () => {
    //
    //   this.callback(null, content)
    // }
    //
    // console.log(11111111111, xmlContent)
    // parser.write(xmlContent).close()
  }

  transformTag(source) {
    const target = this.target;
    const wxsArray = Object.keys(_Targets.Targets).map(item => _Targets.Targets[item].xjsTag);
    const wxsReg = new RegExp(`\\b<(?:${wxsArray.join('|')})([\\s>)])`, 'mg');
    return source.replace(wxsReg, `<${target.xjsTag}$1`);
  }

  transformAttribute(source) {
    const target = this.target;
    const xmlArray = Object.keys(_Targets.Targets).map(item => _Targets.Targets[item].xmlAttr);
    const xmlReg = new RegExp(`\\b(?:${xmlArray.join('|')})(\\w+)`, 'mg');
    return source.replace(xmlReg, `${target.xmlAttr}$1`);
  }

  transformEvent(source) {
    // 这个需要特殊处理 对于微信bind可以加或者不加:后面的事件属性小写
    const target = this.target;
    const xmlEventReg = /(\s)(?:bind:?([a-z])|on([A-Z]))/mg;

    if (target.name = _Targets.Targets.Wechat.name) {
      return source.replace(xmlEventReg, `$1${target.xmlEvent}${'$2'.toLowerCase()}`);
    } else {
      return source.replace(xmlEventReg, `$1${target.xmlEvent}${'$2'.toUpperCase()}`);
    }
  }

  transformEventPrevent(source) {
    const target = this.target;
    const xmlEventReg = /(\s)catch:?([a-zA-Z])/mg;

    if (target.name = _Targets.Targets.Wechat.name) {
      return source.replace(xmlEventReg, `$1${target.xmlEventPrevent}${'$2'.toLowerCase()}`);
    } else {
      return source.replace(xmlEventReg, `$1${target.xmlEventPrevent}${'$2'.toUpperCase()}`);
    }
  }

}

function _default(source) {
  this.cacheable && this.cacheable();
  return new MiniXMLLoader(this, source);
}

module.exports = exports["default"];