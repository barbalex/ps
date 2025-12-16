import { observe } from 'jotai-effect'

import {
  operationsQueueAtom,
  shortTermOnlineAtom,
  addNotificationAtom,
  store,
} from '../store.ts'
import { executeOperation } from './executeOperation.ts'
import { revertOperation } from './revertOperation.ts'
import { removeOperation } from './removeOperation.ts'
import { add } from 'proj4/dist/lib/projections'

// returns unobserve function
// https://jotai.org/docs/extensions/effect
// TODO: make this dependent on store.shortTermOnline
// TODO: ensure function is run all 30 seconds
export const observeOperations = (store) =>
  observe(async (get, set) => {
    const online = get(shortTermOnlineAtom)
    const operations = get(operationsQueueAtom)
    console.log(`observeOperations, operations queue:`, operations)
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
      await executeOperation(firstOperation)
    } catch (error) {
      console.error('observeOperations, error executing operation:', error)
      // TODO: surface
      const lcMessage = error.message?.toLowerCase?.()
      // if auth error: get new auth token
      // TODO: ensure if clause is correct
      if (lcMessage.includes('jwt')) {
        // TODO: get new auth token
        console.log('observeOperations, need to get new auth token')
        return store.set(addNotificationAtom, {
          intent: 'error',
          title: 'Authentication error',
          body: 'Please log out and log back in to continue syncing your changes.',
        })
      } else if (lcMessage.includes('uniqueness violation')) {
        console.log(
          'There is a conflict with exact same changes - ingoring the error thrown',
        )
        store.set(addNotificationAtom, {
          intent: 'info',
          title: 'Conflict detected',
          body: `This edit already exists on the server. Your change is thus ignored.`,
        })

        return revertOperation(firstOperation)
      } else if (error.code === '23505') {
        // duplicate key value violates unique constraint
        // TODO: catch uniqueness violations: revert and inform user
        store.set(addNotificationAtom, {
          intent: 'error',
          title: 'Uniqueness violation',
          body: error.message,
        })
      }
      // if network error: return, setting shortTermOnline false
      // else: Move this operation to the end of the queue to prevent it from blocking others, inform use
    }
    // if successful: return remove operation
    return removeOperation(firstOperation)
  }, store)
