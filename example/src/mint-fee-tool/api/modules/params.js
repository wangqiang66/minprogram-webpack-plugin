/**
 * function: 请求表单的配置信息
 * author  : wq
 * update  : 2019/8/2 15:58
 */
import request from '@/api/api'

export const TEMPLATE_CONFIG = '/business/api/business/feecalculator/template'
export const TEMPLATE_PICK_LIST = '/business/api/business/feecalculator/dict'
export const TEMPLATE_CONFIG_CHILDREN = '/business/api/business/feecalculator/businesstemplate'

export function getTemplateConfig(data) {
  return request.get(TEMPLATE_CONFIG, data, {
    definedUrl: TEMPLATE_CONFIG
  })
}

export function getTemplateConfigChildren(data) {
  return request.post(TEMPLATE_CONFIG_CHILDREN, data, {
    definedUrl: TEMPLATE_CONFIG_CHILDREN
  })
}

export function getTemplatePickList(data) {
  return request.post(TEMPLATE_PICK_LIST, data, {
    definedUrl: TEMPLATE_PICK_LIST,
    noLoading: true
  })
}
