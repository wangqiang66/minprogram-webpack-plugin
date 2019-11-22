/**
 * function: search
 * author  : wq
 * update  : 2019/8/1 14:44
 */
import { UPDATE_ORDER_ITEM, RESET_ORDER_ITEM } from '../types/index'
import { searchOrder } from '@/mint-fee-tool/api'
import { searchUpdate } from '@/mint-fee-tool/redux/actions/search'

export function orderUpdate(order) {
  return {
    type: UPDATE_ORDER_ITEM,
    order
  }
}

export function orderReset() {
  return {
    type: RESET_ORDER_ITEM
  }
}

export function orderSearch(searchWord) {
  return function (dispatch) {
    return searchOrder({ applyNo: searchWord })
      .then(data => {
        dispatch(searchUpdate(searchWord))
        dispatch(orderUpdate(data || {}))
        return data
      })
  }
}
