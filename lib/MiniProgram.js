/**
 * function: MiniProgram
 * author  : wq
 * update  : 2019/10/18 14:56
 */

const { dirname, basename } = require('path')

module.exports = class MiniProgram {

  constructor() {

  }

  //


  loadEntry (entry) {
    this.entryName = []

    for (const entryPath of entry) {
      const itemContext = dirname(entryPath)
      const fileName = basename(entryPath, '.json')
    }
  }
}
