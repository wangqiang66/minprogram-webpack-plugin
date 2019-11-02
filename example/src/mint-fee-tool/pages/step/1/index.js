/**
 * function: index
 * author  : wq
 * update  : 2019/5/23 16:15
 */
import { connect } from '@ddjf/ddepp/src/utils/epp-redux/index'
import { Toast } from '@ddjf/ddepp/src/utils/dd/modal'
import { isEmptyValue } from '@ddjf/ddepp/src/utils/type'
import {
  searchUpdate,
  requestConfigList,
  templateConfigReset,
  paramsReplace,
  requestTemplatePickList,
  initTemplateConfigValue,
  dealTemplateTreeByCurrentValue,
  listenTemplateChildren
} from '@/mint-fee-tool/redux/actions'
import LoadUser from '@/utils/user'

const mapStateToData = state => ({
  search: state.search.search,
  params: state.params,
  paramsList: state.paramsList,
  companyCode: state.params.companyCode || '',
  productCode: state.params.productCode || '',
  cityList: state.user.branchList.map(item => {
    return { ...item, key: item.companyCode, name: item.cityName }
  }),
  configList: state.template.basicInfo
    .map(item => {
      return {
        ...item,
        placeholder: (item.componentType === 'pick' ? '请选择' : '请输入') + item.feeMetadataName.replace(/%?（[^）]*）$/, '')
      }
    }),
  paramsDependentTree: state.paramsDependent
})

const mapDispatchToPage = (dispatch, state) => ({
  setSearchWord: (search) => dispatch(searchUpdate(search)),
  requestTemplateConfig: (params) => dispatch(requestConfigList(params)),
  cleanTemplateConfig: () => dispatch(templateConfigReset()),
  replaceParams: (params) => dispatch(paramsReplace(params)),
  requestTemplatePickList: (params, name) => dispatch(requestTemplatePickList(params, name)),
  initTemplateConfigValue: (configList, order, defaultFirst) => dispatch(initTemplateConfigValue(configList, order, defaultFirst)),
  dealTemplateTreeByCurrentValue: (tree, data, currentItem) => dispatch(dealTemplateTreeByCurrentValue(tree, data, currentItem)),
  listenTemplateChildren: (params, order, defaultFirst) => dispatch(listenTemplateChildren(params, order, defaultFirst))
})

Page(connect(mapStateToData, mapDispatchToPage)(LoadUser(true)({
  data: {},
  goSearch() {
    dd.navigateTo({
      url: '/mint-fee-tool/pages/search/search/index'
    })
  },
  // 选择城市
  selectCity(e, index, item) {
    const oldValue = this.data.companyCode
    const value = e.detail.value
    if (oldValue !== value) {
      this.cleanTemplateConfig()
      this.replaceParams({
        companyCode: value,
        franchiseeCode: item.orgType === 'JMS' ? 'franchisee' : 'self'
      })
      this.requestTemplatePickList({
        queryId: 'getProductCode',
        queryParams: [
          {
            'paramName': 'companyCode',
            'paramValue': value
          }
        ]
      }, 'productKind')
    }
  },
  selectProductKind(e) {
    const oldValue = this.data.productCode
    const value = e.detail.value
    if (oldValue !== value) {
      const companyCode = this.data.companyCode
      const franchiseeCode = this.data.params.franchiseeCode
      this.replaceParams({
        companyCode,
        productCode: value,
        franchiseeCode
      })
      return this.requestTemplateConfig({
        companyCode,
        productCode: value,
        franchiseeCode
      })
        .then(async data => {
          const order = {
            companyCode,
            productCode: value,
            franchiseeCode
          }
          const params = await this.initTemplateConfigValue([].concat(...Object.values(data)), order, true)
          const innerSecondParams = await this.listenTemplateChildren(order, order, true)
          this.replaceParams({ ...params, ...innerSecondParams })
        })
    }
  },
  // 处理其他的表单值
  inputOtherInfo(e) {
    const value = e.detail.value
    const name = e.target.dataset.name
    const oldValue = this.data.params[name]
    if (oldValue !== value) {
      this.dealTemplateTreeByCurrentValue(this.data.paramsDependentTree, { ...this.data.params, [name]: value }, { name, value })
    }
  },
  nextStep() {
    const { companyCode, productCode } = this.data
    if (!companyCode) {
      Toast('请选择所在城市')
      return false
    }
    if (!productCode) {
      Toast('请选择业务品种')
      return false
    }
    const configList = this.data.configList || []
    const params = this.data.params
    for (let item of configList) {
      const value = params[item.feeMetadataCode]
      if (isEmptyValue(value)) {
        Toast(item.placeholder)
        return false
      }
      // 处理最大最小值
      const max = item.maxValue
      const min = item.minValue
      if ((max && value > max) || (min && value < min)) {
        if (max && min) {
          Toast(`${item.feeMetadataName}: 在${min}--${max}之间`)
        } else if (max) {
          Toast(`${item.feeMetadataName}: 不大于${max}`)
        } else if (min) {
          Toast(`${item.feeMetadataName}: 不小于${min}`)
        }
      }
    }
    dd.navigateTo({
      url: '/mint-fee-tool/pages/step/2/index'
    })
  }
})))
