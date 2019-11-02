/**
 * function: user
 * author  : wq
 * update  : 2019/5/22 17:36
 */
import { UPDATE_ORDER_ITEM, RESET_ORDER_ITEM } from '../../types/index'

const defaultState = {}
export const order = (state = defaultState, action) => {
  switch (action.type) {
    case UPDATE_ORDER_ITEM:
      return action.order
    case RESET_ORDER_ITEM:
      return defaultState
    default:
      return state
  }
}
