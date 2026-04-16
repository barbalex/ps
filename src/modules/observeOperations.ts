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
import { invalidatePostgrestToken } from './fetchPostgrestToken.ts'

// returns unobserve function
// https://jotai.org/docs/extensions/effect
// TODO: make this dependent on store.shortTermOnline
// TODO: ensure function is run all 30 seconds
export const observeOperations = () =>
  observe(async (get) => {
    const online = get(shortTermOnlineAtom)
    const operations = get(operationsQueueAtom)
    // console.log(`observeOperations, operations queue:`, operations)
    // TODO: reset this return
    // is set to test queued operations processing
    // return
    // TODO: write function that:
    // if offline: returns
    if (!online) {
      return console.log('operationsQueueAtom returning due to being offline')
    }

    // loops operations
    // runs operation
    // Process oldest operation first so dependent operations (e.g. insert
    // before update) are sent to the server in the correct order.
    const firstOperation = operations.at(-1)
    if (!firstOperation) return

    try {
      await executeOperation(firstOperation)
    } catch (error) {
      if (error?.code === '23505') {
        // duplicate key value violates unique constraint
        // The row is already present on server, so this operation is effectively done.
        return removeOperation(firstOperation)
      }

      console.error('observeOperations, error executing operation:', error)
      // TODO: surface
      const lcMessage = error.message?.toLowerCase?.()
      // if auth error: get new auth token
      // TODO: ensure if clause is correct
      if (lcMessage.includes('jwt')) {
        // Token is invalid or expired — clear the cache so the next retry fetches a fresh one
        invalidatePostgrestToken()
        console.log(
          'observeOperations, JWT error: invalidating token cache for retry',
        )
        return store.set(addNotificationAtom, {
          intent: 'error',
          title: 'Authentication error',
          body: 'Please log out and log back in to continue syncing your changes.',
        })
      } else if (
        error?.code === '42501' ||
        lcMessage.includes('permission denied') ||
        lcMessage.includes('insufficient privilege')
      ) {
        // Server rejected the write due to insufficient role — revert optimistic change
        const hint = error?.hint ?? error?.details ?? ''
        const hintText = hint ? ` ${hint}` : ''
        store.set(addNotificationAtom, {
          intent: 'error',
          title: 'Not authorized',
          body: `You do not have permission to ${firstOperation.operation} in "${firstOperation.table}". The change has been reverted.${hintText}`,
        })
        await revertOperation(firstOperation)
        return removeOperation(firstOperation)
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
      }

      // if network error: return, setting shortTermOnline false
      // else: Move this operation to the end of the queue to prevent it from blocking others, inform use
      return
    }
    // if successful: return remove operation
    return removeOperation(firstOperation)
  }, store)
