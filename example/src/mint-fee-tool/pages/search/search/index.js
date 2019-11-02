/**
 * function: index
 * author  : wq
 * update  : 2019/5/23 16:15
 */
import { connect } from '@ddjf/ddepp/src/utils/epp-redux/index'
import {
  searchWordUpdate,
  searchWordClean,
  orderSearch,
  requestTemplatePickList,
  requestConfigList,
  initTemplateConfigValue,
  paramsReplace,
  listenTemplateChildren
} from '@/mint-fee-tool/redux/actions'

const mapStateToData = state => ({
  search: state.search.searchWord,
  cityList: state.user.branchList.map(item => {
    return { ...item, key: item.companyCode, name: item.cityName }
  }),
})

const mapDispatchToPage = (dispatch, state) => ({
  setSearchWord: (search) => dispatch(searchWordUpdate(search)),
  clearSearchWord: () => dispatch(searchWordClean()),
  orderSearch: (params) => dispatch(orderSearch(params)),
  requestTemplatePickList: (params, name) => dispatch(requestTemplatePickList(params, name)),
  requestTemplateConfig: (params) => dispatch(requestConfigList(params)),
  initTemplateConfigValue: (configList, order) => dispatch(initTemplateConfigValue(configList, order)),
  paramsReplace: params => dispatch(paramsReplace(params)),
  listenTemplateChildren: (params, order) => dispatch(listenTemplateChildren(params, order))
})

Page(connect(mapStateToData, mapDispatchToPage)({
  data: {
    showNoData: false
  },
  inputSearchWord(ev) {
    this.setSearchWord(ev)
  },
  search(ev) {
    return this.orderSearch(ev)
      .then(async data => {
        if (data) {
          await this.dealTemplateByOrder(data)
          dd.navigateBack()
        }
        else {
          this.setData({
            showNoData: true
          })
        }
      })
  },
  cancel() {
    dd.navigateBack()
  },
  // 根据订单处理模板
  async dealTemplateByOrder(data) {
    const cityList = this.data.cityList || []
    const companyCode = data.companyCode
    const params = {}
    let innerParams = {}
    let innerSecondParams = {}
    // 城市在当前的城市之中
    if (companyCode && cityList.find(item => item.key === companyCode)) {
      const item = cityList.find(item => item.key === companyCode)
      params.companyCode = companyCode
      params.franchiseeCode = item.orgType === 'JMS' ? 'franchisee' : 'self'
      data.franchiseeCode = params.franchiseeCode
      // 处理业务种类
      // eslint-disable-next-line
      const list = await this.requestTemplatePickList({
        queryId: 'getProductCode',
        queryParams: [
          {
            'paramName': 'companyCode',
            'paramValue': companyCode
          }
        ]
      }, 'productKind')
      const productKind = list || []
      const productCode = data.productCode
      if (productCode && productKind.find(item => item.code === productCode)) {
        params.productCode = productCode
        const templateConfig = await this.requestTemplateConfig({
          companyCode,
          productCode
        })
        innerParams = await this.initTemplateConfigValue([].concat(...Object.values(templateConfig)), data)
        innerSecondParams = await this.listenTemplateChildren(innerParams, data)
      }
    }
    this.paramsReplace({ ...params, ...innerParams, ...innerSecondParams })
  }
}))
