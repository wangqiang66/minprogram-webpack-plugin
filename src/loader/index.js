/**
 * function: index
 * author  : wq
 * update  : 2019/11/21 15:05
 */
import MiniXMLLoader from './xml-loader'
import MiniSJSLoader from './sjs-loader'
import MiniCssLoader from './css-loader'
import path from 'path'
import { Targets } from '../plugin/Targets'

export default function (source) {
  this.cacheable && this.cacheable()
  const resourcePath = this.resourcePath
  const xjsName = Object.keys(Targets).map(item => Targets[item].xjsName)
  const xmlName = Object.keys(Targets).map(item => Targets[item].xmlName)
  const cssName = Object.keys(Targets).map(item => Targets[item].cssName)
  const fileExtname = path.extname(resourcePath)
  if (xjsName.indexOf(fileExtname.substring(1)) > -1) {
    return new MiniSJSLoader(this, source)
  } else if (xmlName.indexOf(fileExtname.substring(1)) > -1) {
    return new MiniXMLLoader(this, source)
  } else if (cssName.indexOf(fileExtname.substring(1)) > -1) {
    return new MiniCssLoader(this, source)
  } else {
    return source
  }
}
