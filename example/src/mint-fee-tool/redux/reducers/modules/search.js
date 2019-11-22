/**
 * function: user
 * author  : wq
 * update  : 2019/5/22 17:36
 */
import { UPDATE_SEARCH_WORD, CLEAN_SEARCH_WORD, UPDATE_SEARCH, CLEAN_SEARCH } from '../../types/index'

export const search = (state = { search: '', searchWord: '' }, action) => {
  switch (action.type) {
    case UPDATE_SEARCH_WORD:
      return {
        ...state,
        searchWord: action.searchWord
      }
    case CLEAN_SEARCH_WORD:
      return {
        ...state,
        searchWord: ''
      }
    case UPDATE_SEARCH:
      return {
        ...state,
        search: action.search
      }
    case CLEAN_SEARCH:
      return {
        ...state,
        search: ''
      }
    default:
      return state
  }
}
