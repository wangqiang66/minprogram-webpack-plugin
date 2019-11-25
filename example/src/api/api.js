/**
 * function: api
 * author  : wq
 * update  : 2018/9/5 9:29
 */
import wx from 'wx'
import AppConfig from '@/config/index'
import { getLocalSession, removeLocalSession, getUserSession } from '../api/index'

// eslint-disable-next-line
let fly
let sessionFly
let requestTime = 1
if (process.env.ENV_CONFIG === 'prod') {
  const Fly = require('flyio/dist/npm/wx')
  fly = new Fly()
  sessionFly = new Fly()
} else {
  if (AppConfig.debug) {
    const Fly = require('flyio/dist/npm/fly')
    const EngineWrapper = require('flyio/dist/npm/engine-wrapper')
    const mock = require('../api/mock').default
    const engine = EngineWrapper(mock)
    fly = new Fly(engine)
    sessionFly = new Fly(engine)
  } else {
    const Fly = require('flyio/dist/npm/wx')
    fly = new Fly()
    sessionFly = new Fly()
  }
}

fly.config.baseURL = process.env.BASE_API
fly.config.timeout = 30 * 1000
sessionFly.config.baseURL = process.env.BASE_API
sessionFly.config.timeout = 30 * 1000 // process.env.BASE_API

fly.interceptors.request.use((request) => {
  console.log('请求数据', request.url, request.body)
  if (!fly.config.headers.sessionKey) {
    const session = getLocalSession()
    if (!session) {
      // 获取session后继续下面的操作
      fly.lock()
      // eslint-disable-next-line
      function dealSession() {
        return getUserSession().then(data => {
          request.headers['sessionKey'] = data
          fly.config.headers.sessionKey = data
          fly.unlock()
          if (!request.noLoading) {
            wx.showNavigationBarLoading()
          }
          return request
        })
          .catch((err) => {
            const err1 = {
              retCode: '-003',
              retMsg: err.retMsg || '请求session出错'
            }
            throw err1
          })
      }
      return dealSession()
    } else {
      request.headers['sessionKey'] = session
      fly.config.headers.sessionKey = session
    }
  }
  if (!request.noLoading) {
    wx.showNavigationBarLoading()
  }
  return request
})

fly.interceptors.response.use(
  (response, promise) => {
    console.log('响应返回数据', response.request.url, response.data)
    if (!response.request.noLoading) {
      wx.hideNavigationBarLoading()
    }
    requestTime = 1
    const data = response.data || {}
    if (data.retCode !== '1') {
      if (!response.request.defineError) {
        wx.showToast(data.retMsg)
      }
      return promise.reject(data)
    }
    return promise.resolve(data.data)
  },
  (err, promise) => {
    console.log('响应返回数据出错', err.request.url, err.response)
    if (!err.request.noLoading) {
      wx.hideNavigationBarLoading()
    }
    if (err.status === 401 || err.status === 403) {
      requestTime++
      removeLocalSession()
      fly.config.headers.sessionKey = null
      fly.lock()
      // eslint-disable-next-line
      function dealSession() {
        return getUserSession().then(data => {
          fly.unlock()
          return fly.request(err.request)
        })
      }
      if (requestTime++ > 3) {
        wx.showToast('session: 建立会话失败, 请退出重试')
        promise.reject({
          retCode: '-002',
          retMsg: 'session: 建立会话失败, 请退出重试'
        })
        return false
      }
      return dealSession()
    }
    if (!err.request.defineError) {
      let data = err.message
      try {
        data = err.response.data.retMsg || data || '系统错误，请联系系统管理员！'
      } catch (e) {
        data = '系统错误，请联系系统管理员！'
      }
      wx.showToast(data)
    }
    const error = {
      retCode: '-001',
      retMsg: '网络连接失败，请稍后重试'
    }
    promise.reject(error)
  }
)

sessionFly.interceptors.request.use((request) => {
  console.log('请求数据', request.url, request.body)
  if (!request.noLoading) {
    wx.showNavigationBarLoading()
  }
  return request
})

sessionFly.interceptors.response.use(
  (response, promise) => {
    console.log('响应返回数据', response.request.url, response.data)
    if (!response.request.noLoading) {
      wx.hideNavigationBarLoading()
    }
    const data = response.data || {}
    if (data.retCode !== '1') {
      if (!response.request.defineError) {
        wx.showToast(data.retMsg)
      }
      return promise.reject(data)
    }
    return promise.resolve(data.data)
  },
  (err, promise) => {
    if (!err.request.noLoading) {
      wx.hideNavigationBarLoading()
    }
    if (!err.request.defineError) {
      wx.showToast(err.message)
    }
    promise.reject({
      retCode: '-001',
      retMsg: '网络连接失败，请稍后重试'
    })
  }
)

export const newFly = sessionFly
export default fly
