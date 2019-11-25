/**
 * function: index
 * author  : wq
 * update  : 2019/5/22 17:21
 */
import { combineReducers } from '@ddjf/minprogram-redux'
import * as user from './modules/user'
import * as session from './modules/session'

export default combineReducers({ ...user, ...session })
