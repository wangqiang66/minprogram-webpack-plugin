/**
 * function: search
 * author  : wq
 * update  : 2019/8/1 14:44
 */
import {
  UPDATE_RECORD_PARAM,
  TEMPLATE_CONFIG_RESET,
  RECORD_PARAM_REPLACE,
  RECORD_PARAMS_RESET,
  TEMPLATE_CONFIG_REPLACE,
  UPDATE_PARAMS_DEPENDENT_TREE,
  TEMPLATE_CONFIG_CHILDREN_RESET,
  TEMPLATE_CONFIG_CHILDREN_REPLACE,
  PARAMS_DEPENDENT_TREE_RESET,
  UPDATE_CHECKED_PARAM_ITEM,
  RESET_CHECKED_PARAM_ITEM
} from '../types/index'
import { getTemplateConfig, getTemplateConfigChildren } from '@/mint-fee-tool/api'
import { requestTemplatePickList } from '../actions'
import { isEmptyValue } from '@ddjf/ddepp/src/utils/type'

export function paramsUpdate(params) {
  return {
    type: UPDATE_RECORD_PARAM,
    params
  }
}

export function paramsReplace(params) {
  return {
    type: RECORD_PARAM_REPLACE,
    params
  }
}

export function paramsReset(parasm) {
  return {
    type: RECORD_PARAMS_RESET
  }
}

export function templateConfigReset() {
  return {
    type: TEMPLATE_CONFIG_RESET
  }
}

export function templateConfigReplace(template) {
  return {
    type: TEMPLATE_CONFIG_REPLACE,
    template
  }
}

export function templateConfigChildReset() {
  return {
    type: TEMPLATE_CONFIG_CHILDREN_RESET
  }
}

export function templateConfigChildReplace(template) {
  return {
    type: TEMPLATE_CONFIG_CHILDREN_REPLACE,
    template
  }
}

export function updateParamsDependentTree(tree) {
  return {
    type: UPDATE_PARAMS_DEPENDENT_TREE,
    tree
  }
}

export function resetParamsDependentTree(tree) {
  return {
    type: PARAMS_DEPENDENT_TREE_RESET
  }
}

export function updateCheckedParamsItem(data) {
  return {
    type: UPDATE_CHECKED_PARAM_ITEM,
    data
  }
}

export function resetCheckedParamsItem() {
  return {
    type: RESET_CHECKED_PARAM_ITEM
  }
}

// 获取配置信息
export function requestConfigList(params) {
  return function (dispatch) {
    return getTemplateConfig(params)
      .then(data => {
        dispatch(templateConfigReplace(data))
        return data
      })
  }
}

// 获取二级配置信息
export function requestChildrenConfigList(params) {
  return function (dispatch) {
    return getTemplateConfigChildren(params)
      .then(data => {
        dispatch(templateConfigChildReplace(data))
        return data
      })
  }
}

/**
 * 生成请求第二次模板的需要依赖项
 * @param data
 * @returns {{}}
 */
function productSecondTemplateList(data = []) {
  if (data.length === 0) {
    return {}
  }
  const totalList = {
    'companyCode': 1,
    'productCode': 1,
    'loanNodeCode': 1,
    'capitalCode': 1,
    'insuranceCompanyCode': 1,
    'channelName': 1,
    'franchiseeCode': 1,
    'chargeWayCode': 1,
    'productTerm': 1
  }
  const list = {
    'companyCode': 1,
    'productCode': 1
  }
  data.forEach(item => {
    if (totalList[item.feeMetadataCode]) {
      list[item.feeMetadataCode] = 1
    }
  })
  return list
}

// 生成依赖(包括第一次模板和第二次模板)
export function productParamsDependentTree() {
  return function (dispatch, getState) {
    const state = getState()
    const tree = {}
    const template = [].concat(...Object.values(state.template || {}))
    const secondTemplate = [].concat(...Object.values(state.templateChildren || {}))
    const data = [...template, ...secondTemplate]
    data.forEach(item => {
      if (item.valueListConfig && item.valueListConfig.queryParams) {
        const dependents = item.valueListConfig.queryParams || []
        dependents.forEach(itm => {
          if (!tree[itm.paramName]) {
            tree[itm.paramName] = []
          }
          tree[itm.paramName].push({
            name: item.feeMetadataCode,
            type: item.componentType,
            params: dependents,
            queryId: item.valueListConfig.queryId
          })
        })
      }
    })
    tree.secondTemplate = productSecondTemplateList(template)
    dispatch(updateParamsDependentTree(tree))
    return tree
  }
}

/**
 * 对于请求的模板进行循环赋值（初始化的时候使用）
 * @param configList: 模板数据
 * @param order     : 订单数据或者定义的一些其他数据
 * @returns {function(*)}
 */
export function initTemplateConfigValue(configList, order = {}, defaultFirst) {
  return async function (dispatch) {
    const tree = dispatch(productParamsDependentTree(configList))
    let params = {}
    const unDealParam = {}
    params.companyCode = order.companyCode
    params.productCode = order.productCode
    params.franchiseeCode = order.franchiseeCode

    // 处理没有依赖的数据
    function dealUnDependentData(item, list = []) {
      const name = item.feeMetadataCode
      if (!isEmptyValue(order[name]) || !isEmptyValue(item.value)) {
        let value
        if (defaultFirst) {
          value = order[name]
          if (isEmptyValue(value)) {
            value = item.value
          }
        } else {
          value = item.value
          if (isEmptyValue(value)) {
            value = order[name]
          }
        }
        // 列表处理
        if (item.componentType === 'pick') {
          const pickItem = list.find(it => it.code === value)
          if (!pickItem) {
            return false
          }
        }
        params[name] = value
        // 根据值来处理处理他的相关依赖
        if (tree[name]) {
          tree[name].forEach(it => {
            if (unDealParam[it.name]) {
              // 处理有依赖的数据
              dealData(unDealParam[it.name])
            }
          })
        }
      }
      return true
    }

    // 处理有依赖的数据
    function dealDependentData(item) {
      const dependentConfig = item.valueListConfig
      const depandentParams = dependentConfig.queryParams
      const name = item.feeMetadataCode
      let canRequestList = true
      const requestParams = []
      for (let i = 0; i < depandentParams.length; i++) {
        let itName = depandentParams[i].paramName
        if (isEmptyValue(params[itName])) {
          canRequestList = false
          break
        }
        requestParams.push({
          'paramName': depandentParams[i].paramName,
          'paramValue': params[itName]
        })
      }
      if (canRequestList) {
        if (unDealParam[name]) {
          unDealParam[name] = null
        }
        // 依赖数据都已经填充，可以请求数据
        return dispatch(requestTemplatePickList({
          queryId: dependentConfig.queryId,
          queryParams: requestParams
        }, name))
          .then(list => {
            dealUnDependentData(item, list)
          })
      }
      else {
        if (!unDealParam[name]) {
          unDealParam[name] = item
        }
      }
      return new Promise(resolve => {
        resolve()
      })
    }

    // 处理数据，只处理到分支
    async function dealData(item) {
      if (!item.valueListConfig) {
        await dealUnDependentData(item)
      }
      else {
        await dealDependentData(item)
      }
      return true
    }

    for (const item of configList) {
      await dealData(item)
    }
    return params
  }
}

// 根据当前选择的值，来处理依赖他的其他数据
/**
 * @param tree 依赖树
 * @param valueMap name: 名称, value: 值
 */
export function dealTemplateTreeByCurrentValue(tree, data = {}, valueMap) {
  return async function (dispatch) {
    const name = valueMap.name
    const value = valueMap.value
    const list = tree[name] || []
    // 请求被依赖的值
    const params = {
      [name]: value
    }
    list.forEach(item => {
      // 对于下拉数据，需要重新请求下拉列表
      if (!item.params.some(it => {
        return isEmptyValue(data[it.paramName])
      })) {
        const requestParams = {
          queryId: item.queryId,
          queryParams: item.params.map(it => ({
            paramName: it.paramName,
            paramValue: data[it.paramName]
          }))
        }
        dispatch(requestTemplatePickList(requestParams, item.name))
      }
      if (data[item.name]) {
        params[item.name] = ''
      }
    })
    let innerParams = {}
    if ((tree.secondTemplate || {})[name]) {
      innerParams = await dispatch(listenTemplateChildren({ ...data, ...params }, { ...data, ...params }), true)
    }
    dispatch(paramsUpdate({ ...params, ...innerParams }))
  }
}

// 监听影响二级模板的数据变动，存在变动并且数据完整，需要重新拉去二级模板
export function listenTemplateChildren(params, order, defaultFirst) {
  return async function (dispatch, getState) {
    const state = getState()
    const varyParams = state.paramsDependent.secondTemplate || {}
    let requestTemplate = true
    const requestParams = {}
    for (let i in varyParams) {
      if (i === 'productTerm') {
        const template = state.template || {}
        const item = template.feeRateRegister.find(item => item.feeMetadataCode === i)
        if (item && item.isVisible === '0') {
          break
        }
      }
      if (isEmptyValue(params[i])) {
        requestTemplate = false
        break
      }
      requestParams[i] = params[i]
    }
    requestParams['franchiseeCode'] = params.franchiseeCode
    if (requestTemplate) {
      return dispatch(requestChildrenConfigList(requestParams))
        .then(async data => {
          const innerParams = await dispatch(initTemplateConfigValue([].concat(...Object.values(data)), {
            ...order
          }, defaultFirst))
          return innerParams
        })
    }
    return {}
  }
}
