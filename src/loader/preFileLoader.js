/**
 * function: 文件处理
 * author  : wq
 * update  : 2019/11/25 15:36
 */

/**
 * 转换文件
 * @param target: 运行目标
 * @param output
 * @param ext
 * @returns {*}
 */
import { Targets } from '../plugin/Targets'

export default function (target, output, ext = '[ext]') {
  const namePrefix = '[path]'
  return {
    loader: 'file-loader',
    options: {
      useRelativePath: false,
      name: `${namePrefix}[name].${ext}`,
      context: output,
      outputPath(path) {
        if (/node_modules/.test(path)) {
          if (target.name === Targets.Wechat.name) {
            return `miniprogram_npm${path.split('node_modules')[1]}`
          } else {
            return `node_modules${path.split('node_modules')[1]}`
          }
        }
        return path
      }
    }
  }
}
