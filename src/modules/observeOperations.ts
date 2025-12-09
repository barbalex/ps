import { observe } from 'jotai-effect'

import { operationsQueueAtom, shortTermOnlineAtom } from '../store.ts'

// returns unobserve function
// https://jotai.org/docs/extensions/effect
// TODO: make this dependent on store.shortTermOnline
// TODO: ensure function is run all 30 seconds
export const observeOperations = (store) =>
  observe((get, set) => {
    console.log(`operationsQueueAtom changed`, get(operationsQueueAtom))
    // TODO: write function that:
    // if offline: returns
    if (!get(shortTermOnlineAtom)) {
      return console.log(
        'operationsQueueAtom returning due to not being online',
      )
    }

    const operations = get(operationsQueueAtom)
    // loops operations
    // runs operation
    // if successful: return remove operation by id
    // if error:
    // if auth error: get new auth token
    // catch uniqueness violations: revert and inform user
    // if network error: return, setting shortTermOnline false
    // else: Move this operation to the end of the queue to prevent it from blocking others, inform user
  }, store)
