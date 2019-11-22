/**
 * function: index
 * author  : wq
 * update  : 2018/9/19 16:39
 */

export default function (request, responseCallback) {
  const mock = require('./mock')
  let data
  if (['GET', 'HEAD', 'DELETE', 'OPTION'].indexOf(request.method) !== -1) {
    data = mock.default[request.definedUrl](request.requestData || {})
  }
  else {
    data = mock.default[request.definedUrl](JSON.parse(request.body || '{}'))
  }
  return responseCallback(data)
}
