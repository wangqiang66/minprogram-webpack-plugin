/**
 * function: user
 * author  : wq
 * update  : 2019/5/22 17:36
 */
import { UPDATE_SESSION, REMOVE_SESSION, SESSION_CODE } from '../../types/index'
import { setStorageSync, removeStorageSync } from '@/utils/storage'

export const session = (state = { session: '' }, action) => {
  switch (action.type) {
    case UPDATE_SESSION:
      setStorageSync(SESSION_CODE, action.session)
      return {
        ...state,
        session: action.session
      }
    case REMOVE_SESSION:
      removeStorageSync(SESSION_CODE)
      return {
        ...state,
        session: ''
      }
    default:
      return state
  }
}
