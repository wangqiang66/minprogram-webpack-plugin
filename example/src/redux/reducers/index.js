/**
 * function: index
 * author  : wq
 * update  : 2019/5/22 17:21
 */
import { combineReducers } from 'redux'
import * as user from './modules/user'
import * as session from './modules/session'
import mintFeeTools from '@/mint-fee-tool/redux/reducers'

export default combineReducers({ ...user, ...session, ...mintFeeTools })
