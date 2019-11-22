/**
 * function: mock
 * author  : wq
 * update  : 2018/9/18 18:46
 */
import { SESSION_KEY } from '../modules/session'
import { USER_INFO } from '../modules/user'
import { SEARCH_ORDER, PRODUCT_KIND } from '@/mint-fee-tool/api/modules/order'
import { TEMPLATE_CONFIG, TEMPLATE_PICK_LIST, TEMPLATE_CONFIG_CHILDREN } from '@/mint-fee-tool/api/modules/params'
import { FEE_RESULT_URL } from '@/mint-fee-tool/api/modules/result'

const mockApi = {}
const mockEnvSuccessOrFail = function () {
  const random = 0 // Math.random() * 100
  if (random >= 95) {
    return {
      statusCode: 403,
      headers: '',
      responseText: null
    }
  }
  else {
    return {
      statusCode: 200,
      headers: '',
      responseText: {}
    }
  }
}

const mockProtocolSuccessOrFail = function () {
  const random = 0 // Math.random() * 100
  if (random > 90) {
    return {
      retCode: '5000',
      retMsg: '系统错误，请稍后重试！',
      success: false
    }
  }
  else {
    return {
      retCode: '1',
      retMsg: '成功',
      data: {}
    }
  }
}

const getInternetData = (data) => {
  const envRet = mockEnvSuccessOrFail()
  if (envRet.statusCode !== 200) {
    return envRet
  }
  const protocolRet = mockProtocolSuccessOrFail()
  if (protocolRet.retCode !== '1') {
    envRet.responseText = protocolRet
    return envRet
  }
  protocolRet.data = data
  envRet.data = protocolRet
  return envRet
}

export const sessionKey = mockApi[SESSION_KEY] = () => {
  return getInternetData(123456)
}

export const searchOrder = mockApi[SEARCH_ORDER] = () => {
  return getInternetData({
    'companyName': '深圳公司',
    'companyCode': '010000',
    'productCode': 'TFB_YSL_NJY_ISR',
    'productName': '提放保（有赎楼）',
    'insuranceCompanyName': '中国太平洋财产保险股份有限公司',
    'insuranceCompanyCode': 'BIZBXGSTP',
    'capitalName': '中国光大银行股份有限公司',
    'capitalCode': 'BIZHZYHGD',
    'loanNodeName': '赎楼放全款',
    'loanNodeCode': 'SLJFQK',
    'commercialLoanAmt': 120000,
    'foreclosureAmt': 100000,
    'interestRate': ''
  })
}

export const userInfo = mockApi[USER_INFO] = () => {
  return getInternetData({
    'mobile': '13828815216',
    'fullname': '孙思楠',
    'companyCode': '010000',
    'branchList': [{
      'code': '010171',
      'cityNo': '110000',
      'cityName': '北京市',
      'companyCode': '010000',
      'orgType': 'JMS'
    }, {
      'code': '769111',
      'cityNo': '441900',
      'cityName': '东莞市',
      'companyCode': '769000',
      'orgType': ''
    }, { 'code': '755114', 'cityNo': '440300', 'cityName': '深圳市', 'companyCode': '755000', 'orgType': '' }],
    'roleResourceList': [{
      'roleCode': 'QDJL',
      'resourceCode': 'dataDecision',
      'resourceName': '决策报表'
    }, { 'roleCode': 'QDJL', 'resourceCode': 'systemNotice', 'resourceName': '系统公告' }, {
      'roleCode': 'QDJL',
      'resourceCode': 'ODSReport',
      'resourceName': '统计报表'
    }, { 'roleCode': 'QDJL', 'resourceCode': 'yxgjlb', 'resourceName': '营销工具列表' }, {
      'roleCode': 'QDJLG',
      'resourceCode': 'yxgjlb',
      'resourceName': '营销工具列表'
    }, { 'roleCode': 'QDJL', 'resourceCode': 'noticeList', 'resourceName': '公告列表' }, {
      'roleCode': 'QDJLG',
      'resourceCode': 'AppointInterview',
      'resourceName': '预约面签'
    }, { 'roleCode': 'QDJLG', 'resourceCode': 'AppointInterview', 'resourceName': '预约面签' }, {
      'roleCode': 'QDJLG',
      'resourceCode': 'FeeRateConfirm',
      'resourceName': '费率确认'
    }, { 'roleCode': 'QDJLG', 'resourceCode': 'FeeRateConfirm', 'resourceName': '费率确认' }, {
      'roleCode': 'QDJLG',
      'resourceCode': 'specialApprovalFlow',
      'resourceName': '特批流程/异常反馈_'
    }, {
      'roleCode': 'QDJLG',
      'resourceCode': 'specialApproval_pending',
      'resourceName': '特批/异常反馈_待办事项'
    }, {
      'roleCode': 'QDJLG',
      'resourceCode': 'specialApproval_handled',
      'resourceName': '特批/异常反馈_已办事项'
    }, { 'roleCode': 'QDJLG', 'resourceCode': 'PendingPayment', 'resourceName': '待缴费' }, {
      'roleCode': 'QDJLG',
      'resourceCode': 'yjgl_lcyj',
      'resourceName': '预警&贷后'
    }, { 'roleCode': 'QDJLG', 'resourceCode': 'dhfxgl', 'resourceName': '贷后风险管理' }, {
      'roleCode': 'QDJLG',
      'resourceCode': 'ztfxyw',
      'resourceName': '在途风险业务'
    }, { 'roleCode': 'QDJLG', 'resourceCode': 'wjfxyw', 'resourceName': '完结风险业务' }, {
      'roleCode': 'QDJL',
      'resourceCode': 'personOffice',
      'resourceName': '个人办公'
    }, { 'roleCode': 'QDJL', 'resourceCode': 'flowEvent', 'resourceName': '流程事项' }, {
      'roleCode': 'QDJL',
      'resourceCode': 'orderFlow',
      'resourceName': '订单流程(新)'
    }, { 'roleCode': 'QDJL', 'resourceCode': 'PendingToDo', 'resourceName': '待办事项' }, {
      'roleCode': 'QDJL',
      'resourceCode': 'HandledToDo',
      'resourceName': '已办事项'
    }, { 'roleCode': 'QDJL', 'resourceCode': 'CompletedToDo', 'resourceName': '办结事项' }, {
      'roleCode': 'QDJL',
      'resourceCode': 'orderFlowOld',
      'resourceName': '订单流程(旧)'
    }, { 'roleCode': 'QDJL', 'resourceCode': 'myToDoEvent', 'resourceName': '待办事项' }, {
      'roleCode': 'QDJL',
      'resourceCode': 'myHandledEvent',
      'resourceName': '已办事项'
    }, { 'roleCode': 'QDJL', 'resourceCode': 'myDoneEvent', 'resourceName': '办结事项' }, {
      'roleCode': 'QDJL',
      'resourceCode': 'dbsx_njjyb',
      'resourceName': '待办事项_南京交易保'
    }, { 'roleCode': 'QDJL', 'resourceCode': 'ybsx_njjyb', 'resourceName': '已办事项_南京交易保' }, {
      'roleCode': 'QDJL',
      'resourceCode': 'myStartEvent',
      'resourceName': '我发起的事项'
    }, { 'roleCode': 'QDJL', 'resourceCode': 'myStartFlow', 'resourceName': '新建流程' }, {
      'roleCode': 'QDJL',
      'resourceCode': 'myDraft',
      'resourceName': '我的草稿'
    }, { 'roleCode': 'QDJL', 'resourceCode': 'myCompletedFlow', 'resourceName': '我的办结' }, {
      'roleCode': 'QDJL',
      'resourceCode': 'xxgl',
      'resourceName': '操作中心'
    }, { 'roleCode': 'QDJL', 'resourceCode': 'orderManager', 'resourceName': '订单管理' }, {
      'roleCode': 'QDJL',
      'resourceCode': 'dealTask',
      'resourceName': '订单列表'
    }, { 'roleCode': 'QDJL', 'resourceCode': 'zlgls', 'resourceName': '资料管理' }, {
      'roleCode': 'QDJL',
      'resourceCode': 'ywcxlb',
      'resourceName': '业务查询'
    }, { 'roleCode': 'QDJL', 'resourceCode': '订单查询', 'resourceName': '订单查询(旧)' }, {
      'roleCode': 'QDJL',
      'resourceCode': 'ywlb',
      'resourceName': '业务列表'
    }, { 'roleCode': 'QDJL', 'resourceCode': 'MatterType', 'resourceName': '事项分类-PC' }, {
      'roleCode': 'QDJL',
      'resourceCode': 'CostMark',
      'resourceName': '费率登记'
    }, { 'roleCode': 'QDJL', 'resourceCode': 'CostItemMark', 'resourceName': '费项登记' }, {
      'roleCode': 'QDJLG',
      'resourceCode': 'personOffice',
      'resourceName': '个人办公'
    }, { 'roleCode': 'QDJLG', 'resourceCode': 'systemNotice', 'resourceName': '系统公告' }, {
      'roleCode': 'QDJLG',
      'resourceCode': 'noticeList',
      'resourceName': '公告列表'
    }, { 'roleCode': 'QDJLG', 'resourceCode': 'flowEvent', 'resourceName': '流程事项' }, {
      'roleCode': 'QDJLG',
      'resourceCode': 'ClaimToDo',
      'resourceName': '待认领事项'
    }, { 'roleCode': 'QDJLG', 'resourceCode': 'orderFlow', 'resourceName': '订单流程(新)' }, {
      'roleCode': 'QDJLG',
      'resourceCode': 'PendingToDo',
      'resourceName': '待办事项'
    }, { 'roleCode': 'QDJLG', 'resourceCode': 'HandledToDo', 'resourceName': '已办事项' }, {
      'roleCode': 'QDJLG',
      'resourceCode': 'CompletedToDo',
      'resourceName': '办结事项'
    }, { 'roleCode': 'QDJLG', 'resourceCode': 'pendList', 'resourceName': '待办事项_数据/权限审批' }, {
      'roleCode': 'QDJLG',
      'resourceCode': 'handledList',
      'resourceName': '已办事项_数据/权限审批'
    }, { 'roleCode': 'QDJLG', 'resourceCode': 'myStartEvent', 'resourceName': '我发起的事项' }, {
      'roleCode': 'QDJLG',
      'resourceCode': 'myStartFlow',
      'resourceName': '新建流程'
    }, { 'roleCode': 'QDJLG', 'resourceCode': 'myDraft', 'resourceName': '我的草稿' }, {
      'roleCode': 'QDJLG',
      'resourceCode': 'myCompletedFlow',
      'resourceName': '我的办结'
    }, { 'roleCode': 'QDJLG', 'resourceCode': 'xxgl', 'resourceName': '操作中心' }, {
      'roleCode': 'QDJLG',
      'resourceCode': 'orderManager',
      'resourceName': '订单管理'
    }, { 'roleCode': 'QDJLG', 'resourceCode': 'dealTask', 'resourceName': '订单列表' }, {
      'roleCode': 'QDJLG',
      'resourceCode': 'zlgls',
      'resourceName': '资料管理'
    }, { 'roleCode': 'QDJLG', 'resourceCode': 'ywcxlb', 'resourceName': '业务查询' }, {
      'roleCode': 'QDJLG',
      'resourceCode': 'ywlb',
      'resourceName': '业务列表'
    }, { 'roleCode': 'QDJLG', 'resourceCode': 'MatterType', 'resourceName': '事项分类-PC' }, {
      'roleCode': 'QDJLG',
      'resourceCode': 'CostMark',
      'resourceName': '费率登记'
    }, { 'roleCode': 'QDJLG', 'resourceCode': 'UploadImg', 'resourceName': '资料反馈' }, {
      'roleCode': 'QDJLG',
      'resourceCode': 'MatterType-mb',
      'resourceName': '事项分类-移动端'
    }, { 'roleCode': 'QDJLG', 'resourceCode': 'CostMark', 'resourceName': '费率登记' }, {
      'roleCode': 'QDJLG',
      'resourceCode': 'UploadImg',
      'resourceName': '资料反馈'
    }, { 'roleCode': 'QDJLG', 'resourceCode': 'UserTask13', 'resourceName': '数据修改驳回' }, {
      'roleCode': 'QDJLG',
      'resourceCode': 'ODSReport',
      'resourceName': '统计报表'
    }, { 'roleCode': 'QDJLG', 'resourceCode': 'dataDecision', 'resourceName': '决策报表' }, {
      'roleCode': 'QDJLG',
      'resourceCode': 'appManage',
      'resourceName': '应用管理'
    }, { 'roleCode': 'QDJLG', 'resourceCode': 'zzcp', 'resourceName': '资质初判' }]
  })
}

export const templateConfig = mockApi[TEMPLATE_CONFIG] = () => {
  return getInternetData({
    'basicInfo': [
      {
        'feeMetadataCode': 'capitalCode',
        'feeMetadataName': '合作银行',
        'feeMetadataType': '前端传入',
        'componentType': 'pick',
        'value': 'BIZHZYHGD',
        'maxValue': '',
        'minValue': '',
        'nameShowOnPage': '',
        'isVisible': '1',
        'isEditable': '1',
        'needShowDefault': '',
        'belongGroupCode': 'basicInfo',
        'belongGroupName': '基本信息',
        'sortInGroup': 100,
        'roundType': '',
        'numOfDecimalPlace': '',
        'valueListConfig': {
          'queryId': 'getCapitalCode',
          'queryParams': [
            {
              'paramName': 'companyCode',
              'paramValue': ''
            },
            {
              'paramName': 'productCode',
              'paramValue': ''
            }
          ]
        }
      },
      {
        'feeMetadataCode': 'insuranceCompanyCode',
        'feeMetadataName': '合作保险',
        'feeMetadataType': '前端传入',
        'componentType': 'pick',
        'value': '',
        'maxValue': '',
        'minValue': '',
        'nameShowOnPage': '',
        'isVisible': '1',
        'isEditable': '1',
        'needShowDefault': '',
        'belongGroupCode': 'basicInfo',
        'belongGroupName': '基本信息',
        'sortInGroup': 110,
        'roundType': '',
        'numOfDecimalPlace': '',
        'valueListConfig': {
          'queryId': 'getInsuranceCompanyCode',
          'queryParams': [
            {
              'paramName': 'companyCode',
              'paramValue': ''
            },
            {
              'paramName': 'productCode',
              'paramValue': ''
            },
            {
              'paramName': 'capitalCode',
              'paramValue': ''
            }
          ]
        }
      },
      {
        'feeMetadataCode': 'loanNodeCode',
        'feeMetadataName': '放款节点',
        'feeMetadataType': '前端传入',
        'componentType': 'pick',
        'value': '',
        'maxValue': '',
        'minValue': '',
        'nameShowOnPage': '',
        'isVisible': '1',
        'isEditable': '1',
        'needShowDefault': '',
        'belongGroupCode': 'basicInfo',
        'belongGroupName': '基本信息',
        'sortInGroup': 120,
        'roundType': '',
        'numOfDecimalPlace': '',
        'valueListConfig': {
          'queryId': 'getLoanNodeCode',
          'queryParams': [
            {
              'paramName': 'companyCode',
              'paramValue': ''
            },
            {
              'paramName': 'productCode',
              'paramValue': ''
            },
            {
              'paramName': 'capitalCode',
              'paramValue': ''
            },
            {
              'paramName': 'insuranceCompanyCode',
              'paramValue': ''
            }
          ]
        }
      },
      {
        'feeMetadataCode': 'commercialLoanAmt',
        'feeMetadataName': '商业贷款金额（元）',
        'feeMetadataType': '前端传入',
        'componentType': 'number',
        'value': '',
        'maxValue': '',
        'minValue': 0,
        'nameShowOnPage': '',
        'isVisible': '1',
        'isEditable': '1',
        'needShowDefault': '',
        'belongGroupCode': 'basicInfo',
        'belongGroupName': '基本信息',
        'sortInGroup': 130,
        'roundType': '',
        'numOfDecimalPlace': '',
        'valueListConfig': ''
      },
      {
        'feeMetadataCode': 'foreclosureAmt',
        'feeMetadataName': '赎楼金额（元）',
        'feeMetadataType': '前端传入',
        'componentType': 'number',
        'value': '',
        'maxValue': '',
        'minValue': 0,
        'nameShowOnPage': '',
        'isVisible': '1',
        'isEditable': '1',
        'needShowDefault': '',
        'belongGroupCode': 'basicInfo',
        'belongGroupName': '基本信息',
        'sortInGroup': 140,
        'roundType': '',
        'numOfDecimalPlace': '',
        'valueListConfig': ''
      },
      {
        'feeMetadataCode': 'interestRate',
        'feeMetadataName': '贷款利率%（年化）',
        'feeMetadataType': '前端传入',
        'componentType': 'number',
        'value': '',
        'maxValue': '',
        'minValue': 0,
        'nameShowOnPage': '',
        'isVisible': '1',
        'isEditable': '1',
        'needShowDefault': '',
        'belongGroupCode': 'basicInfo',
        'belongGroupName': '基本信息',
        'sortInGroup': 150,
        'roundType': '',
        'numOfDecimalPlace': '',
        'valueListConfig': ''
      }
    ],
    'feeRateRegister': [
      {
        'feeMetadataCode': 'channelName',
        'feeMetadataName': '渠道标签',
        'feeMetadataType': '前端传入',
        'componentType': 'input',
        'value': '普通渠道',
        'maxValue': '',
        'minValue': '',
        'nameShowOnPage': '',
        'isVisible': '1',
        'isEditable': '0',
        'needShowDefault': '1',
        'belongGroupCode': 'feeRateRegister',
        'belongGroupName': '费率登记',
        'sortInGroup': 200,
        'roundType': '',
        'numOfDecimalPlace': '',
        'valueListConfig': ''
      },
      {
        'feeMetadataCode': 'riskLevel',
        'feeMetadataName': '风险等级',
        'feeMetadataType': '后台配置',
        'componentType': 'input',
        'value': '风险标准件',
        'maxValue': '',
        'minValue': '',
        'nameShowOnPage': '',
        'isVisible': '1',
        'isEditable': '0',
        'needShowDefault': '1',
        'belongGroupCode': 'feeRateRegister',
        'belongGroupName': '费率登记',
        'sortInGroup': 210,
        'roundType': '',
        'numOfDecimalPlace': '',
        'valueListConfig': ''
      },
      {
        'feeMetadataCode': 'priceTag',
        'feeMetadataName': '价格标签',
        'feeMetadataType': '后台配置',
        'componentType': 'pick',
        'value': '正常定价',
        'maxValue': '',
        'minValue': '',
        'nameShowOnPage': '',
        'isVisible': '1',
        'isEditable': '1',
        'needShowDefault': '1',
        'belongGroupCode': 'feeRateRegister',
        'belongGroupName': '费率登记',
        'sortInGroup': 220,
        'roundType': '',
        'numOfDecimalPlace': '',
        'valueListConfig': {
          'queryId': 'getPriceTag',
          'queryParams': [
            {
              'paramName': 'companyCode',
              'paramValue': ''
            },
            {
              'paramName': 'productCode',
              'paramValue': ''
            },
            {
              'paramName': 'loanNodeCode',
              'paramValue': ''
            },
            {
              'paramName': 'channelName',
              'paramValue': ''
            }
          ]
        }
      },
      {
        'feeMetadataCode': 'discountCoefficient',
        'feeMetadataName': '定价折扣',
        'feeMetadataType': '前端传入',
        'componentType': 'pick',
        'value': '',
        'maxValue': 100,
        'minValue': 0,
        'nameShowOnPage': '',
        'isVisible': '1',
        'isEditable': '1',
        'needShowDefault': '1',
        'belongGroupCode': 'feeRateRegister',
        'belongGroupName': '费率登记',
        'sortInGroup': 230,
        'roundType': '',
        'numOfDecimalPlace': '',
        'valueListConfig': {
          'queryId': 'getPriceLabel',
          'queryParams': [
            {
              'paramName': 'companyCode',
              'paramValue': ''
            },
            {
              'paramName': 'productCode',
              'paramValue': ''
            },
            {
              'paramName': 'loanNodeCode',
              'paramValue': ''
            },
            {
              'paramName': 'channelName',
              'paramValue': ''
            },
            {
              'paramName': 'priceTag',
              'paramValue': ''
            }
          ]
        }
      }
    ]
  })
}

export const templateSecondConfig = mockApi[TEMPLATE_CONFIG_CHILDREN] = () => {
  return getInternetData({
    'feeRateRegister': [
      {
        'feeMetadataCode': 'channelPricePerOrder',
        'feeMetadataName': '渠道价/笔（%）',
        'feeMetadataType': '前端传入',
        'parameterPosition': 'inputParameter',
        'parameterAlias': '',
        'componentType': 'number',
        'value': 0.6,
        'maxValue': '',
        'minValue': 0.6,
        'nameShowOnPage': '渠道价%/笔',
        'isVisible': '1',
        'isEditable': '1',
        'needShowDefault': '1',
        'belongGroupCode': 'fillInFeeRate',
        'belongGroupName': '费率登记',
        'sortInGroup': 1,
        'roundType': '',
        'numOfDecimalPlace': '',
        'valueListConfig': ''
      },
      {
        'feeMetadataCode': 'agentCommissionPerOrder',
        'feeMetadataName': '代收返佣/笔（%）',
        'feeMetadataType': '前端传入',
        'parameterPosition': 'inputParameter',
        'parameterAlias': '',
        'componentType': 'number',
        'value': 0,
        'maxValue': 0,
        'minValue': '',
        'nameShowOnPage': '代收返佣/笔（%）',
        'isVisible': '1',
        'isEditable': '1',
        'needShowDefault': '1',
        'belongGroupCode': 'fillInFeeRate',
        'belongGroupName': '费率登记',
        'sortInGroup': 3,
        'roundType': '',
        'numOfDecimalPlace': '',
        'valueListConfig': ''
      },
      {
        'feeMetadataCode': 'adjustedChannelPricePerOrder',
        'feeMetadataName': '渠道价/笔（调节后）（%）',
        'feeMetadataType': '计算获取',
        'parameterPosition': 'inputParameter',
        'parameterAlias': '',
        'componentType': 'number',
        'value': '',
        'maxValue': '',
        'minValue': '',
        'nameShowOnPage': '渠道价/笔（调节后）（%）',
        'isVisible': '1',
        'isEditable': '0',
        'needShowDefault': '0',
        'belongGroupCode': 'fillInFeeRate',
        'belongGroupName': '费率登记',
        'sortInGroup': 2,
        'roundType': '',
        'numOfDecimalPlace': '',
        'valueListConfig': ''
      }
    ],
    'feeItemRegister': [
      {
        'feeMetadataCode': 'stampTaxFee',
        'feeMetadataName': '印花税',
        'feeMetadataType': '前端传入',
        'parameterPosition': 'inputParameter',
        'parameterAlias': '',
        'componentType': 'number',
        'value': '',
        'maxValue': '',
        'minValue': 0,
        'nameShowOnPage': '印花税（元）',
        'isVisible': '1',
        'isEditable': '1',
        'needShowDefault': '1',
        'belongGroupCode': 'fillInFeeItem',
        'belongGroupName': '费项登记',
        'sortInGroup': 3,
        'roundType': '四舍五入',
        'numOfDecimalPlace': '2',
        'valueListConfig': ''
      },
      {
        'feeMetadataCode': 'impawnRegisterFee',
        'feeMetadataName': '抵押登记费',
        'feeMetadataType': '前端传入',
        'parameterPosition': 'inputParameter',
        'parameterAlias': '',
        'componentType': 'number',
        'value': 80,
        'maxValue': '',
        'minValue': '',
        'nameShowOnPage': '抵押登记费（元）',
        'isVisible': '1',
        'isEditable': '0',
        'needShowDefault': '1',
        'belongGroupCode': 'fillInFeeItem',
        'belongGroupName': '费项登记',
        'sortInGroup': 4,
        'roundType': '四舍五入',
        'numOfDecimalPlace': '2',
        'valueListConfig': ''
      },
      {
        'feeMetadataCode': 'remoteTrafficFee',
        'feeMetadataName': '偏远交通费',
        'feeMetadataType': '前端传入',
        'parameterPosition': 'inputParameter',
        'parameterAlias': '',
        'componentType': 'number',
        'value': '',
        'maxValue': 1000,
        'minValue': 500,
        'nameShowOnPage': '偏远交通费（元）',
        'isVisible': '1',
        'isEditable': '1',
        'needShowDefault': '1',
        'belongGroupCode': 'fillInFeeItem',
        'belongGroupName': '费项登记',
        'sortInGroup': 1,
        'roundType': '四舍五入',
        'numOfDecimalPlace': '2',
        'valueListConfig': ''
      },
      {
        'feeMetadataCode': 'evaluationServiceFee',
        'feeMetadataName': '评估服务费',
        'feeMetadataType': '前端传入',
        'parameterPosition': 'inputParameter',
        'parameterAlias': '',
        'componentType': 'number',
        'value': '',
        'maxValue': '',
        'minValue': 0,
        'nameShowOnPage': '评估服务费（元）',
        'isVisible': '1',
        'isEditable': '1',
        'needShowDefault': '1',
        'belongGroupCode': 'fillInFeeItem',
        'belongGroupName': '费项登记',
        'sortInGroup': 2,
        'roundType': '四舍五入',
        'numOfDecimalPlace': '2',
        'valueListConfig': ''
      }
    ]
  })
}

export const templatePickList = mockApi[TEMPLATE_PICK_LIST] = (params) => {
  if (params.queryId === 'getProductCode') {
    return getInternetData([
      {
        'code': 'SLY_YSL_NJY_CSH',
        'name': '及时贷（非交易赎楼）',
        'data': ''
      },
      {
        'code': 'SLY_YSL_YJY_CSH',
        'name': '及时贷（交易赎楼）',
        'data': ''
      },
      {
        'code': 'TFB_YSL_NJY_ISR',
        'name': '提放保（有赎楼）',
        'data': ''
      },
      {
        'code': 'TFB_NSL_NJY_ISR',
        'name': '提放保（无赎楼）',
        'data': ''
      }
    ])
  }
  if (params.queryId === 'getCapitalCode') {
    return getInternetData([
      {
        'code': 'BIZHZYHGD',
        'name': '中国光大银行股份有限公司',
        'data': ''
      },
      {
        'code': 'HXYXGFYXGSB235',
        'name': '华夏银行股份有限公司',
        'data': ''
      },
      {
        'code': 'BIZHZYHJT',
        'name': '交通银行股份有限公司',
        'data': ''
      }
    ])
  }
  if (params.queryId === 'getInsuranceCompanyCode') {
    return getInternetData([
      {
        'code': 'BIZBXGSTP',
        'name': '中国太平洋财产保险股份有限公司',
        'data': ''
      }
    ])
  }
  if (params.queryId === 'getLoanNodeCode') {
    return getInternetData([
      {
        'code': 'DYDJFWK',
        'name': '递件放尾款',
        'data': ''
      },
      {
        'code': 'DYCJFWK',
        'name': '出件放尾款',
        'data': ''
      },
      {
        'code': 'SLJFQK',
        'name': '赎楼放全款',
        'data': ''
      },
      {
        'code': 'SLFQK（TH）',
        'name': '赎楼放全款（同行）',
        'data': ''
      },
      {
        'code': 'DJFWK（TH）',
        'name': '递件放尾款（同行）',
        'data': ''
      },
      {
        'code': 'CJFWK（TH）',
        'name': '出件放尾款（同行）',
        'data': ''
      },
      {
        'code': 'SPJFQK',
        'name': '审批放全款',
        'data': ''
      }
    ])
  }
  if (params.queryId === 'getChargeWayCode') {
    return getInternetData([
      {
        'code': 'calculateDaily',
        'name': '按天计息',
        'data': ''
      },
      {
        'code': 'fixedTerm',
        'name': '固定期限',
        'data': ''
      }
    ])
  }
  if (params.queryId === 'getProductTerm') {
    return getInternetData([
      {
        'code': '30',
        'name': '30',
        'data': ''
      },
      {
        'code': '45',
        'name': '45',
        'data': ''
      },
      {
        'code': '60',
        'name': '60',
        'data': ''
      }
    ])
  }
  if (params.queryId === 'getPriceTag') {
    return getInternetData([
      {
        'code': '特殊折扣',
        'name': '特殊折扣',
        'data': ''
      },
      {
        'code': '正常定价',
        'name': '正常定价',
        'data': ''
      },
      {
        'code': '员工/合作关键人',
        'name': '员工/合作关键人',
        'data': ''
      }
    ])
  }
  return getInternetData([
    {
      'code': '员工/合作关键人',
      'name': '员工/合作关键人',
      'data': ''
    }
  ])
}

export const feeResult = mockApi[FEE_RESULT_URL] = () => {
  return getInternetData([
    {
      'feeMetadataName': '基础收费',
      'feeMetadataType': '计算获取',
      'feeMetadataCode': 'baseFee',
      'unit': '元',
      'value': 6000,
      'maxValue': '',
      'minValue': '',
      'nameShowOnPage': '基础收费（元）',
      'belongGroupCode': 'receivablesDetailOfCustomer',
      'belongGroupName': '应收明细-客户',
      'isEditable': '0',
      'isVisible': '1',
      'needShowDefault': '1',
      'sortInGroup': 1,
      'roundType': '四舍五入',
      'numOfDecimalPlace': '0'
    },
    {
      'feeMetadataName': '返佣费',
      'feeMetadataType': '计算获取',
      'feeMetadataCode': 'rakebackFee',
      'unit': '元',
      'value': 0,
      'maxValue': '',
      'minValue': '',
      'nameShowOnPage': '其中：渠道返佣（元）',
      'belongGroupCode': 'receivablesDetailOfCustomer',
      'belongGroupName': '应收明细-客户',
      'isEditable': '0',
      'isVisible': '1',
      'needShowDefault': '0',
      'sortInGroup': 7,
      'roundType': '四舍五入',
      'numOfDecimalPlace': '0'
    },
    {
      'feeMetadataName': '基础服务费',
      'feeMetadataType': '计算获取',
      'feeMetadataCode': 'baseServiceFee',
      'unit': '元',
      'value': 0,
      'maxValue': '',
      'minValue': '',
      'nameShowOnPage': '其中：基础服务费（元）',
      'belongGroupCode': 'receivablesDetailOfCustomer',
      'belongGroupName': '应收明细-客户',
      'isEditable': '0',
      'isVisible': '1',
      'needShowDefault': '0',
      'sortInGroup': 2,
      'roundType': '四舍五入',
      'numOfDecimalPlace': '0'
    },
    {
      'feeMetadataName': '代收费用合计',
      'feeMetadataType': '计算获取',
      'feeMetadataCode': 'substituteFeeCount',
      'unit': '元',
      'value': 0,
      'maxValue': '',
      'minValue': '',
      'nameShowOnPage': '代收费用合计',
      'belongGroupCode': 'receivablesDetailOfCustomer',
      'belongGroupName': '应收明细-客户',
      'isEditable': '0',
      'isVisible': '1',
      'needShowDefault': '1',
      'sortInGroup': 5,
      'roundType': '四舍五入',
      'numOfDecimalPlace': '0'
    },
    {
      'feeMetadataName': '附加服务费用合计',
      'feeMetadataType': '计算获取',
      'feeMetadataCode': 'accessorialServiceFeeCount',
      'unit': '元',
      'value': 0,
      'maxValue': '',
      'minValue': '',
      'nameShowOnPage': '附加服务费用合计',
      'belongGroupCode': 'receivablesDetailOfCustomer',
      'belongGroupName': '应收明细-客户',
      'isEditable': '0',
      'isVisible': '1',
      'needShowDefault': '1',
      'sortInGroup': 4,
      'roundType': '四舍五入',
      'numOfDecimalPlace': '0'
    },
    {
      'feeMetadataName': '费用合计',
      'feeMetadataType': '计算获取',
      'feeMetadataCode': 'feeTotal',
      'unit': '元',
      'value': 0,
      'maxValue': '',
      'minValue': '',
      'nameShowOnPage': '费用合计（不含保费）（元）',
      'belongGroupCode': 'receivablesDetailOfCustomer',
      'belongGroupName': '应收明细-客户',
      'isEditable': '0',
      'isVisible': '1',
      'needShowDefault': '1',
      'sortInGroup': 6,
      'roundType': '四舍五入',
      'numOfDecimalPlace': '0'
    },
    {
      'feeMetadataName': '保费',
      'feeMetadataType': '计算获取',
      'feeMetadataCode': 'insurancePremium',
      'unit': '元',
      'value': 6000,
      'maxValue': '',
      'minValue': '',
      'nameShowOnPage': '其中：保费（元）',
      'belongGroupCode': 'receivablesDetailOfCustomer',
      'belongGroupName': '应收明细-客户',
      'isEditable': '0',
      'isVisible': '1',
      'needShowDefault': '0',
      'sortInGroup': 2,
      'roundType': '四舍五入',
      'numOfDecimalPlace': '2'
    }
  ])
}

export default mockApi
