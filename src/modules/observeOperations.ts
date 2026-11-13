import { observe } from 'jotai-effect'
import type { Effect } from 'jotai-effect'
import type { Getter } from 'jotai/vanilla'

import {
  operationsQueueAtom,
  shortTermOnlineAtom,
  operationsRetryTickAtom,
  addNotificationAtom,
  store,
} from '../store.ts'
import type { QueuedOperation } from '../store.ts'
import { executeOperation } from './executeOperation.ts'
import {
  applyOperations,
  applyOperationsRpcEnabled,
  APPLY_OPERATIONS_BATCH_SIZE,
} from './applyOperations.ts'
import { revertOperation } from './revertOperation.ts'
import { removeOperation } from './removeOperation.ts'
import { invalidatePostgrestToken } from './fetchPostgrestToken.ts'

// returns unobserve function
// https://jotai.org/docs/extensions/effect
// OperationsObserver re-triggers it every 10s
// via operationsRetryTickAtom so failed sends are retried.
let isProcessing = false

// An operation whose server application fails with an unknown error stays
// queued and is retried on every tick — without telling the user, the only
// trace is a non-empty queue badge in a header that says "online". Track
// consecutive failures and speak up once per operation after a few tries.
const STUCK_AFTER_FAILURES = 3
const failureCounts = new Map<string, number>()
const stuckNotified = new Set<string>()

const noteFailedOperation = (
  operation: QueuedOperation,
  detail: string,
  path: 'batch' | 'one-by-one',
) => {
  const count = (failureCounts.get(operation.id) ?? 0) + 1
  failureCounts.set(operation.id, count)
  if (count < STUCK_AFTER_FAILURES || stuckNotified.has(operation.id)) return
  stuckNotified.add(operation.id)
  store.set(addNotificationAtom, {
    intent: 'error',
    duration: 30000,
    title: 'Change not syncing',
    body: `A change in "${operation.table}" could not be synced (${detail || 'unknown error'}). It keeps retrying — if this persists, check "Queued operations" via the header badge.`,
  })
  console.error(
    `observeOperations, operation stuck after ${count} attempts (${path}):`,
    operation,
    detail,
  )
}

const finishOperation = (operation: QueuedOperation) => {
  failureCounts.delete(operation.id)
  stuckNotified.delete(operation.id)
  removeOperation(operation)
}

export const observeOperations = () =>
  observe(
    // observe's Effect type is synchronous; this async effect is
    // fire-and-forget at runtime (a returned Promise is never a Cleanup)
    (async (get: Getter & { peek: Getter }) => {
      // Guard: if a network send is already in-flight, skip this trigger.
      // Without this, rapid queue changes (e.g. "activate all") cause the same
      // oldest operation to be sent multiple times before it is removed, producing 409s.
      if (isProcessing) return

      // always tracked so the periodic tick re-runs this effect
      void get(operationsRetryTickAtom)

      const online = get(shortTermOnlineAtom)
      const operations = get(operationsQueueAtom)
      if (!online) return
      if (!operations.length) return

      if (applyOperationsRpcEnabled()) {
        return await processBatch(operations)
      }
      return await processOneByOne(operations)
    }) as unknown as Effect,
    store,
  )

/** the batch path: one apply_operations RPC per up-to-50 operations */
const processBatch = async (operations: QueuedOperation[]) => {
  // oldest first, capped: slice from the end, then reverse
  const batch = operations.slice(-APPLY_OPERATIONS_BATCH_SIZE).reverse()

  isProcessing = true
  let results
  try {
    results = await applyOperations(batch)
  } catch (error) {
    isProcessing = false
    const err = error as { code?: string; message?: string }
    if (
      err?.code === '28000' ||
      err?.message?.toLowerCase?.().includes('jwt')
    ) {
      invalidatePostgrestToken()
      store.set(addNotificationAtom, {
        intent: 'error',
        title: 'Authentication error',
        body: 'Please log out and log back in to continue syncing your changes.',
      })
      return
    }
    // network or server error: the whole batch stays queued for the retry tick
    console.error('observeOperations, error applying operation batch:', error)
    return
  }
  isProcessing = false

  for (let index = 0; index < batch.length; index++) {
    const operation = batch[index]!
    const result = results[index]!
    switch (result.status) {
      case 'applied':
      case 'duplicate':
        // duplicate: the row is already present on the server, so the
        // operation is effectively done
        finishOperation(operation)
        break
      case 'no-row':
        // the row no longer exists on the server (e.g. deleted by another
        // user) — drop the operation; without a word the user's edit would
        // just silently evaporate on the next sync
        console.warn(
          'observeOperations, update target gone — discarding operation:',
          operation,
        )
        store.set(addNotificationAtom, {
          intent: 'warning',
          title: 'Change not synced',
          body: `The row this change in "${operation.table}" belonged to was deleted on the server. The change has been discarded.`,
        })
        finishOperation(operation)
        break
      case 'permission':
        store.set(addNotificationAtom, {
          intent: 'error',
          title: 'Not authorized',
          body: `You do not have permission to ${operation.operation} in "${operation.table}". The change has been reverted. ${result.detail ?? ''}`,
        })
        await revertOperation(operation)
        finishOperation(operation)
        break
      case 'rejected':
        console.error(
          'observeOperations, dropping rejected operation:',
          operation,
          result.detail,
        )
        store.set(addNotificationAtom, {
          intent: 'error',
          title: 'Change not synced',
          body: `A change in "${operation.table}" could not be synced (${result.detail ?? 'rejected'}). It was removed from the queue — please redo the edit.`,
        })
        finishOperation(operation)
        break
      case 'error': {
        // apply the classification the per-operation path used
        const detail = result.detail ?? ''
        if (detail.startsWith('22P02')) {
          // malformed value: this operation can never succeed — drop it so
          // it doesn't block the queue; the local change stays
          console.error(
            'observeOperations, dropping malformed operation:',
            operation,
          )
          store.set(addNotificationAtom, {
            intent: 'error',
            title: 'Change not synced',
            body: `A change in "${operation.table}" was malformed and could not be synced. It was removed from the queue — please redo the edit.`,
          })
          finishOperation(operation)
        } else if (detail.toLowerCase().includes('uniqueness violation')) {
          store.set(addNotificationAtom, {
            intent: 'info',
            title: 'Conflict detected',
            body: 'This edit already exists on the server. Your change is thus ignored.',
          })
          await revertOperation(operation)
          finishOperation(operation)
        } else {
          // unknown error: keep the operation queued; the retry tick
          // re-sends it (and only it — later operations were applied).
          // Tell the user once it keeps failing — the queue badge alone
          // is indistinguishable from "online, all good"
          noteFailedOperation(operation, detail, 'batch')
        }
        break
      }
    }
  }
}

/** the per-operation fallback path (localStorage 'ps-apply-operations'='off') */
const processOneByOne = async (operations: QueuedOperation[]) => {
  // loops operations
  // runs operation
  // Process oldest operation first so dependent operations (e.g. insert
  // before update) are sent to the server in the correct order.
  const firstOperation = operations.at(-1)
  if (!firstOperation) return

  isProcessing = true
  try {
    await executeOperation(firstOperation)
  } catch (error) {
    // Release the lock BEFORE any queue mutation so the observer can pick up
    // the next operation immediately when removeOperation fires.
    isProcessing = false
    // postgrest-js errors carry code/message/hint/details
    const err = error as {
      code?: string
      message?: string
      hint?: string
      details?: string
    }
    if (err?.code === '23505') {
      // duplicate key value violates unique constraint
      // The row is already present on server, so this operation is effectively done.
      return finishOperation(firstOperation)
    }

    if (err?.message?.includes('Update matched 0 rows')) {
      // The row no longer exists on the server (e.g. deleted by another user).
      // Drop the update — there is nothing to update.
      console.warn(
        'observeOperations, update target gone — discarding operation:',
        firstOperation,
      )
      return finishOperation(firstOperation)
    }

    console.error('observeOperations, error executing operation:', error)
    const lcMessage = err.message?.toLowerCase?.()
    // if auth error: get new auth token
    // TODO: ensure if clause is correct
    if (lcMessage?.includes('jwt')) {
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
      err?.code === '42501' ||
      lcMessage?.includes('permission denied') ||
      lcMessage?.includes('insufficient privilege')
    ) {
      // Server rejected the write due to insufficient role — revert optimistic change
      const hint = err?.hint ?? err?.details ?? ''
      const hintText = hint ? ` ${hint}` : ''
      store.set(addNotificationAtom, {
        intent: 'error',
        title: 'Not authorized',
        body: `You do not have permission to ${firstOperation.operation} in "${firstOperation.table}". The change has been reverted.${hintText}`,
      })
      await revertOperation(firstOperation)
      return finishOperation(firstOperation)
    } else if (lcMessage?.includes('uniqueness violation')) {
      console.log(
        'There is a conflict with exact same changes - ingoring the error thrown',
      )
      store.set(addNotificationAtom, {
        intent: 'info',
        title: 'Conflict detected',
        body: `This edit already exists on the server. Your change is thus ignored.`,
      })

      return revertOperation(firstOperation)
    } else if (err?.code === '22P02') {
      // Malformed value (e.g. a null id serialized into a filter).
      // This operation can never succeed — drop it so it doesn't block
      // the queue. The local change stays; the user should redo the edit.
      console.error(
        'observeOperations, dropping malformed operation:',
        firstOperation,
      )
      store.set(addNotificationAtom, {
        intent: 'error',
        title: 'Change not synced',
        body: `A change in "${firstOperation.table}" was malformed and could not be synced. It was removed from the queue — please redo the edit.`,
      })
      return finishOperation(firstOperation)
    }

    // if network error: return, setting shortTermOnline false
    // else: unknown error — the operation stays queued and the retry tick
    // re-sends it. Tell the user once it keeps failing
    noteFailedOperation(
      firstOperation,
      err?.message ?? 'unknown error',
      'one-by-one',
    )
    return
  }
  // Release lock BEFORE queue mutation so the observer sees isProcessing = false
  // when it fires on the queue change caused by removeOperation.
  isProcessing = false
  // if successful: return remove operation
  return finishOperation(firstOperation)
}
