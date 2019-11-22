/**
 * function: model
 * author  : wq
 * update  : 2019/8/5 11:31
 */
import { isObject } from '@ddjf/ddepp/src/utils/type'

export default {
  showToast(msg) {
    let options = msg
    if (!isObject(msg)) {
      options = { content: msg }
    }
    options.duration = 3000
    return new Promise((resolve, reject) => {
      dd.showToast({
        ...msg,
        success: () => {
          resolve()
        },
        fail: () => {
          reject()
        }
      })
    })
  },
  alert(msg) {
    let options = msg
    if (!isObject(msg)) {
      options = { content: msg }
    }
    options.title = '提示'
    options.buttonText = '确定'
    return new Promise((resolve, reject) => {
      dd.showToast({
        ...msg,
        success: () => {
          resolve()
        },
        fail: () => {
          reject()
        }
      })
    })
  },
  confirm(msg, func) {
    let options = msg
    if (!isObject(msg)) {
      options = { content: msg }
    }
    options.title = '提示'
    options.confirmButtonText = '确定'
    options.cancelButtonText = '取消'
    return new Promise((resolve, reject) => {
      dd.showToast({
        ...msg,
        success: () => {
          resolve()
        },
        fail: () => {
          reject()
        },
        confirm: (result) => {
          func(result)
        }
      })
    })
  }
}
