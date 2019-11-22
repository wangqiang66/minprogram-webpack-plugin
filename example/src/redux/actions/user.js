/**
 * function: search
 * author  : wq
 * update  : 2019/8/1 14:44
 */
import { UPDATE_USERINFO, CLEAN_USERINFO } from '../types/index'
import { getUserInfo } from '@/api'

export function updateUserInfo(user) {
  return {
    type: UPDATE_USERINFO,
    user
  }
}

export function requestUserInfo() {
  return function (dispatch) {
    return getUserInfo()
      .then(data => {
        dispatch(updateUserInfo(data))
        return data
      })
  }
}

export function cleanUserInfo() {
  return {
    type: CLEAN_USERINFO
  }
}
