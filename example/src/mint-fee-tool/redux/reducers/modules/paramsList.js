/**
 * function: user
 * author  : wq
 * update  : 2019/5/22 17:36
 */
import { UPDATE_RECORD_PARAM_LIST, RESET_RECORD_PARAM_LIST } from '../../types/index'

const defaultParamsList = {}
export const paramsList = (state = defaultParamsList, action) => {
  switch (action.type) {
    case UPDATE_RECORD_PARAM_LIST:
      return {
        ...state,
        ...action.params
      }
    case RESET_RECORD_PARAM_LIST:
      return defaultParamsList
    default:
      return state
  }
}
