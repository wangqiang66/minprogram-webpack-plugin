/**
 * function: mock
 * author  : wq
 * update  : 2018/9/18 18:46
 */
import { SESSION_KEY } from '../modules/session'

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

export default mockApi
