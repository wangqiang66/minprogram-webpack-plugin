/**
 * function: search
 * author  : wq
 * update  : 2019/8/1 14:44
 */
import { UPDATE_SEARCH_WORD, CLEAN_SEARCH_WORD, UPDATE_SEARCH, CLEAN_SEARCH } from '../types/index'

export function searchWordUpdate(searchWord) {
  return {
    type: UPDATE_SEARCH_WORD,
    searchWord
  }
}

export function searchWordClean(searchWord = '') {
  return {
    type: CLEAN_SEARCH_WORD,
    searchWord
  }
}

export function searchUpdate(search) {
  return {
    type: UPDATE_SEARCH,
    search
  }
}

export function searchClean(search = '') {
  return {
    type: CLEAN_SEARCH,
    search
  }
}
