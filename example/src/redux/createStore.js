/**
 * function: createStore
 * author  : wq
 * update  : 2019/5/23 10:03
 */
import { createStore, applyMiddleware } from 'redux'
import thunk from 'redux-thunk'
import promise from 'redux-promise-middleware'
import logger from 'redux-logger'
import reducer from '@/redux/reducers'

const middleWare = applyMiddleware(thunk, promise, logger)

export default (data = {}) => {
  return createStore(reducer, data, middleWare)
}
