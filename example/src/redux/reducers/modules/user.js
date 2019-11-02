/**
 * function: user
 * author  : wq
 * update  : 2019/5/22 17:36
 */
import { UPDATE_USERINFO, CLEAN_USERINFO } from '../../types/index'

const defaultUserInfo = {
  mobile: '',
  companyCode: '',
  branchList: [],
  roleBaseResourceList: []
}

export const user = (state = defaultUserInfo, action) => {
  switch (action.type) {
    case UPDATE_USERINFO:
      return {
        ...state,
        ...action.user
      }
    case CLEAN_USERINFO:
      return defaultUserInfo
    default:
      return state
  }
}
