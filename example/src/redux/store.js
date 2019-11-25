/**
 * function: store
 * author  : wq
 * update  : 2019/8/1 18:16
 */

import { createStore } from '@ddjf/minprogram-redux'
import reducer from '@/redux/reducers'

export default createStore(reducer)
