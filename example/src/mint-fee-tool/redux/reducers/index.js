/**
 * function: index
 * author  : wq
 * update  : 2019/5/22 17:21
 */
import * as search from './modules/search'
import * as order from './modules/order'
import * as params from './modules/params'
import * as paramsList from './modules/paramsList'

export default { ...search, ...order, ...params, ...paramsList }
