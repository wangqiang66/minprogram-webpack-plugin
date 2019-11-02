/**
 * function: session
 * author  : wq
 * update  : 2019/8/1 17:39
 */
import { newFly } from '@/api/api'
import store from '@/redux/store'
import { SESSION_CODE } from '@/redux/types'
import { sessionUpdate, sessionRemove } from '@/redux/actions'
import { getStorageSync } from '@/utils/storage'
import wx from 'wx'

export const SESSION_KEY = '/base/api/base/dingtalk/login/getsession'

function getAuthCode() {
  return new Promise((resolve, reject) => {
    dd.getAuthCode({
      success: res => {
        resolve(res.authCode)
      },
      fail: err => {
        reject(err)
      }
    })
  })
}

export const getLocalSession = data => {
  let sessionKey = store.getState().session.session
  if (!sessionKey) {
    sessionKey = getStorageSync(SESSION_CODE)
    if (sessionKey) {
      store.dispatch(sessionUpdate(sessionKey))
    }
  }
  return sessionKey
}

export function removeLocalSession() {
  store.dispatch(sessionRemove())
}

export function getUserSession() {
  console.log('开始获取免登code')
  return getAuthCode()
    .catch(err => {
      wx.showToast(`获取免登code失败：${err}`)
      throw err
    })
    .then(code => {
      return newFly.get(SESSION_KEY, {
        code,
        appType: '01',
        type: '01',
        form: 'eapp'
      }, {
        definedUrl: SESSION_KEY,
        noLoading: true
      })
    })
    .then(data => {
      store.dispatch(sessionUpdate(data))
      return data
    })
    .catch(data => {
      setTimeout(() => {
        dd.reLaunch({
          url: '/mint-e-query/pages/errorpage/base/base'
        })
      }, 2000)
      throw data
    })
}
