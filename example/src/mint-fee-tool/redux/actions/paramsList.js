/**
 * function: 处理请求的下拉框
 * author  : wq
 * update  : 2019/8/1 14:44
 */
import { UPDATE_RECORD_PARAM_LIST, RESET_RECORD_PARAM_LIST } from '../types/index'
import { getTemplatePickList } from '@/mint-fee-tool/api'

export function paramsListUpdate(params) {
  return {
    type: UPDATE_RECORD_PARAM_LIST,
    params
  }
}

export function paramListReset(params) {
  return {
    type: RESET_RECORD_PARAM_LIST
  }
}

export function requestTemplatePickList(params, name) {
  return function (dispatch) {
    return getTemplatePickList(params)
      .then(data => {
        dispatch(paramsListUpdate({
          [name]: data.map(item => ({ ...item, key: item.code }))
        }))
        return data
      })
  }
}
