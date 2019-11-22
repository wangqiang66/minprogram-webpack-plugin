/**
 * function: search
 * author  : wq
 * update  : 2019/8/1 14:44
 */
import { getFeeResult } from '@/mint-fee-tool/api'

// 获取配置信息
export function requestFeeResult(params) {
  return function(dispatch) {
    return getFeeResult(params)
      .then(data => {
        return data
      })
  }
}
