/**
 * function: index
 * author  : wq
 * update  : 2019/5/23 16:15
 */
import { connect } from '@ddjf/minprogram-redux'

const mapStateToData = state => ({
  show: true,
  list: [
    {
      src: 'https://cdn.ddjf.com/static/images/epp_tools/icon-zzcp.png',
      resourceCode: 'zzcp',
      text: '资质初判',
    },
    {
      src: 'https://cdn.ddjf.com/static/images/epp_tools/icon-fyjsq.png',
      resourceCode: 'fyjs',
      text: '费用计算器',
    }
  ]
    .filter(item => {
      const roleResourceList = state.user.roleResourceList || []
      if (item.resourceCode === 'fyjs') {
        return true
      }
      return roleResourceList.find(it => it.resourceCode === item.resourceCode)
    })
})

Page(connect(mapStateToData)({
// Page({
  data: {},
  onItemClick(ev) {
    switch (ev.detail.item.text) {
      case '资质初判':
        dd.navigateTo({
          url: '/mint-e-query/pages/index/index'
        })
        break
      case '费用计算器':
        dd.navigateTo({
          url: '/mint-fee-tool/pages/step/1/index'
        })
        break
      default:
        break
    }
  }
// })
}))
