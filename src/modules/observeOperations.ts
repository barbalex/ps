import { observe } from 'jotai-effect'

import { operationsQueueAtom, shortTermOnlineAtom } from '../store.ts'
import { executeOperation } from './executeOperation.ts'
import { revertOperation } from './revertOperation.ts'
import { removeOperation } from './removeOperation.ts'

// returns unobserve function
// https://jotai.org/docs/extensions/effect
// TODO: make this dependent on store.shortTermOnline
// TODO: ensure function is run all 30 seconds
export const observeOperations = (store) =>
  observe((get, set) => {
    const online = get(shortTermOnlineAtom)
    const operations = get(operationsQueueAtom)
    console.log(`operationsQueueAtom changed`, operations)
    // TODO: write function that:
    // if offline: returns
    if (!online) {
      return console.log('operationsQueueAtom returning due to being offline')
    }

    // loops operations
    // runs operation
    const firstOperation = operations.at(0)
    if (!firstOperation) return
    
    try {
      executeOperation(firstOperation)
    } catch (error) {
      const lcMessage = error.message?.toLowerCase?.()
      // if auth error: get new auth token
      // TODO: ensure if clause is correct
      if (lcMessage.includes('jwt')) {
        // TODO: get new auth token
        return console.log('observeOperations, need to get new auth token')
      } else if (lcMessage.includes('uniqueness violation')) {
        console.log(
          'There is a conflict with exact same changes - ingoring the error thrown',
        )
        revertOperation(firstOperation)
      }
      // catch uniqueness violations: revert and inform user
      // if network error: return, setting shortTermOnline false
      // else: Move this operation to the end of the queue to prevent it from blocking others, inform use
    }
    // if successful: return remove operation
    return removeOperation({ set, operation: firstOperation })
  }, store)
