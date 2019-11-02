/**
 * function: user
 * author  : wq
 * update  : 2019/5/22 17:36
 */
import {
  UPDATE_RECORD_PARAM,
  TEMPLATE_CONFIG_RESET,
  RECORD_PARAM_REPLACE,
  RECORD_PARAMS_RESET,
  TEMPLATE_CONFIG_REPLACE,
  UPDATE_PARAMS_DEPENDENT_TREE,
  TEMPLATE_CONFIG_CHILDREN_REPLACE,
  TEMPLATE_CONFIG_CHILDREN_RESET,
  PARAMS_DEPENDENT_TREE_RESET,
  UPDATE_CHECKED_PARAM_ITEM,
  RESET_CHECKED_PARAM_ITEM
} from '../../types/index'

const defaultParams = {}
export const params = (state = defaultParams, action) => {
  switch (action.type) {
    case UPDATE_RECORD_PARAM:
      return {
        ...state,
        ...action.params
      }
    case RECORD_PARAM_REPLACE:
      return action.params
    case RECORD_PARAMS_RESET:
      return defaultParams
    default:
      return state
  }
}

const defaultTemplate = {
  basicInfo: [],
  feeRateRegister: []
}
export const template = (state = defaultTemplate, action) => {
  switch (action.type) {
    case TEMPLATE_CONFIG_RESET:
      return defaultTemplate
    case TEMPLATE_CONFIG_REPLACE:
      return action.template
    default:
      return state
  }
}

const defaultTemplateChildren = {
  feeRateRegister: [],
  feeItemRegister: []
}
export const templateChildren = (state = defaultTemplateChildren, action) => {
  switch (action.type) {
    case TEMPLATE_CONFIG_CHILDREN_RESET:
      return defaultTemplateChildren
    case TEMPLATE_CONFIG_CHILDREN_REPLACE:
      return action.template
    default:
      return state
  }
}

const defaultParamsDependentTree = {}
export const paramsDependent = (state = defaultParamsDependentTree, action) => {
  switch (action.type) {
    case UPDATE_PARAMS_DEPENDENT_TREE:
      return action.tree
    case PARAMS_DEPENDENT_TREE_RESET:
      return defaultParamsDependentTree
    default:
      return state
  }
}

const defaultCheckedItem = {}
export const checkedParams = (state = defaultCheckedItem, action) => {
  switch (action.type) {
    case UPDATE_CHECKED_PARAM_ITEM:
      return {
        ...state,
        ...action.data
      }
    case RESET_CHECKED_PARAM_ITEM:
      return defaultCheckedItem
    default:
      return state
  }
}
