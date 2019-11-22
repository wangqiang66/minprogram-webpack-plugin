/**
 * function: session
 * author  : wq
 * update  : 2019/8/1 17:39
 */
import fly  from '../../../api/api'

export const FEE_RESULT_URL = '/business/api/business/feecalculator/calculate'

export function getFeeResult(data) {
  return fly.post(FEE_RESULT_URL, data, {
    definedUrl: FEE_RESULT_URL
  })
}
