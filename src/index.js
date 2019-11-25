/**
 * function: index
 * author  : wq
 * update  : 2019/11/21 15:03
 */
const { MiniWebpackPlugin, Targets } = require('./plugin')
module.exports = require('./loader')
module.exports.MiniWebpackPlugin = MiniWebpackPlugin
module.exports.Targets = Targets
module.exports.PreFileLoader = require('./loader/preFileLoader')
