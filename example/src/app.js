// app.js
import { Provider } from '@ddjf/ddepp/src/utils/epp-redux'
import { setApp } from '@ddjf/ddepp/src/utils/dd/dd';
import store from '@/redux/store'
import { getUserInfo } from '@/api'

if (!Promise.prototype.finally || typeof Promise.prototype.finally !== 'function') {
  // eslint-disable-next-line
  Promise.prototype.finally = function (callback) {
    return this.then(
      value => this.constructor.resolve(callback()).then(() => value),
      reason => this.constructor.resolve(callback()).then(() => { throw reason })
    )
  }
}


App(Provider(store)({
  currentPage: null,
  eventFlag: false,
  onLaunch(options) {
    console.log('开始启动E应用')
    setApp(this)
    return getUserInfo()
      .then(() => {
        this.eventFlag = true
        this.currentPage && typeof this.currentPage.getData === 'function' && this.currentPage.getData()
      })
  },

  globalData: {
    detailedInfo: {}
  }
}))
