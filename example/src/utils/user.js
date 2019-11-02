/**
 * function: 判断打开当前页面是否需要首先获取用户信息
 * author  : wq
 * update  : 2019/8/5 10:26
 */
import { getUserInfo, getLocalUser } from '@/api'

export default function(needUser) {
  return function (pageConfig) {
    const _onLoad = pageConfig.onLoad
    function onLoad(options) {
      const user = getLocalUser()
      if (needUser && !user) {
        // eslint-disable-next-line
        getUserInfo()
          .then(data => {
            if (typeof _onLoad === 'function') {
              _onLoad.call(this, options)
            }
          })
      } else {
        if (typeof _onLoad === 'function') {
          _onLoad.call(this, options)
        }
      }
    }
    return {
      ...pageConfig, onLoad
    }
  }
}
