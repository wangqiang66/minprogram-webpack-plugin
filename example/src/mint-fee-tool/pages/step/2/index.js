/**
 * function: index
 * author  : wq
 * update  : 2019/5/23 16:15
 */
import { connect } from '@ddjf/ddepp/src/utils/epp-redux/index'
import { Toast } from '@ddjf/ddepp/src/utils/dd/modal'
import { isEmptyValue } from '@ddjf/ddepp/src/utils/type'
import { dealTemplateTreeByCurrentValue, paramsUpdate, templateConfigReplace, templateConfigChildReplace, updateCheckedParamsItem } from '@/mint-fee-tool/redux/actions'

const mapStateToData = state => ({
  params: state.params,
  paramsList: state.paramsList,
  paramsDependentTree: state.paramsDependent,
  feeConfigList: [].concat(
    state.template.feeRateRegister.filter(item => item.isVisible === '1')
      .map(item => {
        return {
          ...item,
          placeholder: (item.componentType === 'pick' ? '请选择' : '请输入') + item.feeMetadataName.replace(/%?（[^）]*）$/, '')
        }
      }),
    ((state.templateChildren || {}).feeRateRegister || []).filter(item => item.isVisible === '1')
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
  updateParams: (params) => dispatch(paramsUpdate(params)),
  dealTemplateTreeByCurrentValue: (tree, data, currentItem) => dispatch(dealTemplateTreeByCurrentValue(tree, data, currentItem)),
  templateConfigReplace: (template) => dispatch(templateConfigReplace(template)),
  templateConfigChildReplace: (template) => dispatch(templateConfigChildReplace(template)),
  updateCheckedParamsItem: (data) => dispatch(updateCheckedParamsItem(data))
})

Page(connect(mapStateToData, mapDispatchToPage)({
  data: {},
  // 处理其他的表单值
  inputOtherInfo(e, index, pickItem) {
    const value = e.detail.value
    const name = e.target.dataset.name
    const oldValue = this.data.params[name]
    if (oldValue !== value) {
      const otherParams = {
        [name]: value
      }
      if (name === 'priceTag') {
        const item = this.data.feeConfigList.find(item => item.feeMetadataCode === 'discountCoefficient')
        if (item) {
          const copyItem = { ...item }
          copyItem.minValue = pickItem.data.minValue
          copyItem.maxValue = pickItem.data.maxValue
          copyItem.value = pickItem.data.value
          if (!isEmptyValue(copyItem.value)) {
            otherParams['discountCoefficient'] = copyItem.value
          }
          if (pickItem.data.isUnderMinimumChargeControl === '0') {
            otherParams.minChargeAmtForChannel = '0'
          } else {
            otherParams.minChargeAmtForChannel = ''
          }
          const template = this.$store.getState().template
          template.feeRateRegister = template.feeRateRegister.map(it => {
            if (it.feeMetadataCode === 'discountCoefficient') {
              return { ...it, ...copyItem }
            }
            return it
          })
          this.templateConfigReplace(template)
        }
      }
      if (name === 'chargeWayCode') {
        const item = this.data.feeConfigList.find(item => item.feeMetadataCode === 'productTerm')
        if (item) {
          const copyItem = { ...item }
          if (value === 'calculateDaily' || value === 'piecewiseCalculate') {
            copyItem.componentType = 'number'
            copyItem.isVisible = '1'
          } else if (value === 'fixedTerm' || value === 'packagingSale') {
            copyItem.componentType = 'pick'
            copyItem.isVisible = '1'
          } else if (value === 'fixedAmount' || value === 'fixedRate') {
            copyItem.isVisible = '0'
          }
          const template = this.$store.getState().template
          template.feeRateRegister = template.feeRateRegister.map(it => {
            if (it.feeMetadataCode === 'productTerm') {
              return { ...it, ...copyItem }
            }
            return it
          })
          this.templateConfigReplace(template)
        }
      }
      this.dealTemplateTreeByCurrentValue(this.data.paramsDependentTree, { ...this.data.params, ...otherParams }, { name, value })
      if (Object.keys(otherParams).length > 0) {
        this.updateParams(otherParams)
      }
    }
  },
  clickFeeExtend(e) {
    const name = e.target.dataset.name
    this.updateCheckedParamsItem({
      [name]: 1 - !!this.data.chooseItem[name]
    })
  },
  prevStep() {
    dd.navigateBack()
  },
  // 查看费用
  viewFee() {
    const feeConfigList = this.data.feeConfigList || []
    const params = this.data.params
    const chooseItem = this.data.chooseItem || {}
    for (let item of feeConfigList) {
      if (item.isVisible === '0') {
        continue
      }
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
        return false
      }
    }
    const feeItemRegister = this.data.feeItemRegister || []
    for (let item of feeItemRegister) {
      if (!chooseItem[item.feeMetadataCode]) {
        continue
      }
      const value = params[item.feeMetadataCode]
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
        return false
      }
    }
    dd.navigateTo({
      url: '/mint-fee-tool/pages/result/index'
    })
  }
}))
