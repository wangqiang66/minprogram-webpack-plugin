/**
 * function: 费用结果展示
 * author  : wq
 * update  : 2019/5/23 16:15
 */
import { connect } from '@ddjf/ddepp/src/utils/epp-redux'
import {
  requestFeeResult,
  searchClean,
  searchWordClean,
  paramsReset,
  templateConfigReset,
  templateConfigChildReset,
  resetParamsDependentTree,
  paramListReset,
  orderReset,
  resetCheckedParamsItem
} from '@/mint-fee-tool/redux/actions'
import { isEmptyValue } from '@ddjf/ddepp/src/utils/type'

const mapStateToData = state => ({
  configList: state.template.basicInfo
    .map(item => {
      return {
        ...item,
        placeholder: (item.componentType === 'pick' ? '请选择' : '请输入') + item.feeMetadataName.replace(/%?（[^）]*）$/, '')
      }
    }),
  feeConfigList: [].concat(
    state.template.feeRateRegister
      .map(item => {
        return {
          ...item,
          placeholder: (item.componentType === 'pick' ? '请选择' : '请输入') + item.feeMetadataName.replace(/%?（[^）]*）$/, '')
        }
      }),
    ((state.templateChildren || {}).feeRateRegister || [])
      .map(item => {
        return {
          ...item,
          placeholder: (item.componentType === 'pick' ? '请选择' : '请输入') + item.feeMetadataName.replace(/%?（[^）]*）$/, '')
        }
      })
  ),
  feeItemRegister: (state.templateChildren.feeItemRegister || [])
    .map(item => {
      return {
        ...item,
        placeholder: (item.componentType === 'pick' ? '请选择' : '请输入') + item.feeMetadataName.replace(/%?（[^）]*）$/, '')
      }
    }),
  chooseItem: state.checkedParams
})

const mapDispatchToPage = (dispatch, state) => ({
  requestFeeResult: (params) => dispatch(requestFeeResult(params)),
  searchClean: (params) => dispatch(searchClean(params)),
  searchWordClean: (params) => dispatch(searchWordClean(params)),
  paramsReset: (params) => dispatch(paramsReset(params)),
  templateConfigReset: (params) => dispatch(templateConfigReset(params)),
  templateConfigChildReset: (params) => dispatch(templateConfigChildReset(params)),
  resetParamsDependentTree: (params) => dispatch(resetParamsDependentTree(params)),
  paramListReset: (params) => dispatch(paramListReset(params)),
  orderReset: (params) => dispatch(orderReset(params)),
  resetCheckedParamsItem: () => dispatch(resetCheckedParamsItem())
})

function isSwitchDataToNumber(data, isSwitch) {
  if (isSwitch) {
    return Number(data)
  }
  else {
    return data
  }
}

Page(connect(mapStateToData, mapDispatchToPage)({
  data: {
    resultList: [],
    productName: '',
    amount: ''
  },
  onLoad() {
    this.sendRequest()
  },
  sendRequest() {
    const configList = this.data.configList || []
    const feeConfigList = this.data.feeConfigList || []
    const feeItemRegister = this.data.feeItemRegister || []
    const state = this.$store.getState()
    const data = state.params || {}
    const paramsList = state.paramsList || {}
    this.setData({
      'productName': (paramsList['productKind'].find(item => item.code === data.productCode) || {}).name
    })
    // 处理参数
    const requestParams = {
      companyCode: data.companyCode,
      productCode: data.productCode,
      franchiseeCode: data.franchiseeCode
    }
    configList.forEach(item => {
      if (item.isVisible === '0') {
        return false
      }
      if (item.parameterPosition) {
        if (!requestParams[item.parameterPosition]) {
          requestParams[item.parameterPosition] = {}
        }
        requestParams[item.parameterPosition][item.feeMetadataCode] = isSwitchDataToNumber(data[item.feeMetadataCode], item.componentType === 'number' || item.componentType === 'money')
      }
      else {
        requestParams[item.feeMetadataCode] = isSwitchDataToNumber(data[item.feeMetadataCode], item.componentType === 'number' || item.componentType === 'money')
      }
      if (item.parameterAlias && item.parameterAlias.length > 0) {
        item.parameterAlias.forEach(it => {
          if (it.position) {
            if (!requestParams[it.position]) {
              requestParams[it.position] = {}
            }
            requestParams[it.position][it.alias] = isSwitchDataToNumber(data[item.feeMetadataCode], item.componentType === 'number' || item.componentType === 'money')
          }
          else {
            requestParams[it.alias] = isSwitchDataToNumber(data[item.feeMetadataCode], item.componentType === 'number' || item.componentType === 'money')
          }
        })
      }
    })
    feeConfigList.forEach(item => {
      if (item.isVisible === '0') {
        return false
      }
      if (item.parameterPosition) {
        if (!requestParams[item.parameterPosition]) {
          requestParams[item.parameterPosition] = {}
        }
        requestParams[item.parameterPosition][item.feeMetadataCode] = isSwitchDataToNumber(data[item.feeMetadataCode], item.componentType === 'number' || item.componentType === 'money')
      }
      else {
        requestParams[item.feeMetadataCode] = isSwitchDataToNumber(data[item.feeMetadataCode], item.componentType === 'number' || item.componentType === 'money')
      }
      if (item.parameterAlias && item.parameterAlias.length > 0) {
        item.parameterAlias.forEach(it => {
          if (it.position) {
            if (!requestParams[it.position]) {
              requestParams[it.position] = {}
            }
            requestParams[it.position][it.alias] = isSwitchDataToNumber(data[item.feeMetadataCode], item.componentType === 'number' || item.componentType === 'money')
          }
          else {
            requestParams[it.alias] = isSwitchDataToNumber(data[item.feeMetadataCode], item.componentType === 'number' || item.componentType === 'money')
          }
        })
      }
    })
    feeItemRegister.forEach(item => {
      const chooseItem = this.data.chooseItem || {}
      if (item.isVisible === '0') {
        return false
      }
      if (!chooseItem[item.feeMetadataCode]) {
        return false
      }
      if (item.parameterPosition) {
        if (!requestParams[item.parameterPosition]) {
          requestParams[item.parameterPosition] = {}
        }
        requestParams[item.parameterPosition][item.feeMetadataCode] = isSwitchDataToNumber(data[item.feeMetadataCode], item.componentType === 'number' || item.componentType === 'money')
      }
      else {
        requestParams[item.feeMetadataCode] = isSwitchDataToNumber(data[item.feeMetadataCode], item.componentType === 'number' || item.componentType === 'money')
      }
      if (item.parameterAlias && item.parameterAlias.length > 0) {
        item.parameterAlias.forEach(it => {
          if (it.position) {
            if (!requestParams[it.position]) {
              requestParams[it.position] = {}
            }
            requestParams[it.position][it.alias] = isSwitchDataToNumber(data[item.feeMetadataCode], item.componentType === 'number' || item.componentType === 'money')
          }
          else {
            requestParams[it.alias] = isSwitchDataToNumber(data[item.feeMetadataCode], item.componentType === 'number' || item.componentType === 'money')
          }
        })
      }
    })
    if (data.minChargeAmtForChannel) {
      if (!isEmptyValue(requestParams['inputParameter'])) {
        requestParams['inputParameter'] = {}
        requestParams['inputParameter'].minChargeAmtForChannel = '0'
      }
    }
    return this.requestFeeResult(requestParams)
      .then(data => {
        this.setData({
          'resultList': (data || {}).groups || [],
          'amount': ((data || {}).insuredAmount || {}).value
        })
        return data
      })
  },
  prevStep() {
    dd.navigateBack({
      delta: 1
    })
  },
  goHome() {
    // 清理数据
    this.cleanRedux()
    dd.navigateBack({
      delta: 2
    })
  },
  // 清理redux中的所有数据
  cleanRedux() {
    this.searchClean()
    this.searchWordClean()
    this.paramsReset()
    this.templateConfigReset()
    this.templateConfigChildReset()
    this.resetParamsDependentTree()
    this.paramListReset()
    this.orderReset()
    this.resetCheckedParamsItem()
  }
}))
