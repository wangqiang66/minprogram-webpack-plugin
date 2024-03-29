import { defaults, uniq } from 'lodash'

/**
 * function: MinOptions
 * author  : wq
 * update  : 2019/10/23 17:50
 */
const defaultOptions = {
  clear: true,
  include: [],
  exclude: [],
  dot: false,
  definedSplitChunk: false,
  extensions: ['.js'],
  commonModuleName: 'common.js',
  assetsChunkName: '__assets_chunk_name__',
  base: ''
}

export default class MinOptions {
  constructor() {
    this.defaultOptions = defaultOptions
  }

  process(options) {
    const _options = { ...(options || {}), ...this.defaultOptions }
    if (!Array.isArray(_options.extensions)) {
      throw new Error('extensions: type not array')
    }
    if (_options.extensions.length < 1) {
      _options.extensions = defaultOptions.extensions
    }
    _options.include = [].concat(_options.include)
    _options.exclude = [].concat(_options.exclude)
    return _options
  }
}
