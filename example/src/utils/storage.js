/**
 * function: session
 * author  : wq
 * update  : 2019/8/1 18:02
 */
export function setStorage(key, data) {
  return new Promise((resolve, reject) => {
    dd.setStorage({
      key,
      data,
      success: function () {
        resolve()
      },
      fail: function (err) {
        reject(err)
      }
    })
  })
}

export function setStorageSync(key, data) {
  return new Promise((resolve, reject) => {
    dd.setStorageSync({
      key,
      data
    })
    resolve()
  })
}

export function getStorage(key, data) {
  return new Promise((resolve, reject) => {
    dd.getStorage({
      key,
      success: function (res) {
        resolve((res || {}).data)
      },
      fail: function (err) {
        reject(err)
      }
    })
  })
}

export function getStorageSync(key, data) {
  return (dd.getStorageSync({
    key
  }) || {}).data
}

export function removeStorage(key, data) {
  return new Promise((resolve, reject) => {
    dd.removeStorage({
      key,
      success: function () {
        resolve()
      },
      fail: function (err) {
        reject(err)
      }
    })
  })
}

export function removeStorageSync(key, data) {
  return new Promise((resolve, reject) => {
    dd.removeStorageSync({
      key
    })
    resolve()
  })
}
