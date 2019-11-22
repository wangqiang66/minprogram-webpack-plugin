/**
 * function: search
 * author  : wq
 * update  : 2019/8/1 14:44
 */
import { UPDATE_SESSION, REMOVE_SESSION } from '../types/index'

export function sessionUpdate(session) {
  return {
    type: UPDATE_SESSION,
    session
  }
}

export function sessionRemove(session) {
  return {
    type: REMOVE_SESSION
  }
}
