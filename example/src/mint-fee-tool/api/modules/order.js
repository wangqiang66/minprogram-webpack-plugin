/**
 * function: order
 * author  : wq
 * update  : 2019/8/1 16:34
 */
import request from '@/api/api'

export const SEARCH_ORDER = '/business/api/business/feecalculator/ordersearch'
export const PRODUCT_KIND = 'search/order'

export function searchOrder(data) {
  return request.get(SEARCH_ORDER, data, {
    definedUrl: SEARCH_ORDER
  })
}
