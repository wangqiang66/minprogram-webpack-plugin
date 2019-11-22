/**
 * function: session
 * author  : wq
 * update  : 2019/8/1 17:39
 */
import fly from '@/api/api'
import store from '@/redux/store'
import { updateUserInfo } from '@/redux/actions'

export const USER_INFO = '/base/api/base/dingtalk/login/userinfo'


export function getUserInfo() {
  return fly.get(USER_INFO, {}, {
    definedUrl: USER_INFO,
    noLoading: true
  })
    .then(data => {
      const roleResourceList = (data || {}).roleResourceList || []
      // if (roleResourceList.filter(item => item.resourceCode === 'zzcp' || item.resourceCode === 'fyjs').length < 1) {
      //   setTimeout(() => {
      //     dd.reLaunch({
      //       url: '/mint-e-query/pages/errorpage/base/base'
      //     })
      //   }, 2000)
      // } else {
      store.dispatch(updateUserInfo(data))
      // }
    })
    .catch(err => {
      if (err.retCode !== '-003') {
        setTimeout(() => {
          dd.reLaunch({
            url: '/mint-e-query/pages/errorpage/base/base'
          })
        }, 2000)
      }
      throw err
    })
}

export const getLocalUser = data => {
  let user = store.getState().user
  if ((user.branchList || []).length < 1) {
    return false
  }
  else {
    return user
  }
}
