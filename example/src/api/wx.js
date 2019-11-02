/**
 * function: wx
 * author  : wq
 * update  : 2018/9/5 9:41
 */
const wx = {
  loading: null,
  loadingNum: 0,
  showNavigationBarLoading() {
    if (this.loading) {
      this.loadingNum++
    } else {
      this.loadingNum = 1
      this.loading = dd.showLoading({
        content: '加载中'
      })
    }
  },
  hideNavigationBarLoading() {
    if (--this.loadingNum <= 0) {
      dd.hideLoading()
    }
  },
  showToast(msg) {
    if (typeof msg === 'object' && msg !== null) {
      msg = msg.title
    }
    dd.showToast({
      type: 'fail',
      content: msg,
      duration: 3000
    })
  }
}
export default wx
