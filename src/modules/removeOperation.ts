import { operationsQueueAtom, store } from '../store.ts'
import type { QueuedOperation } from '../store.ts'

export const removeOperation = (operation: QueuedOperation) => {
  const operations = store.get(operationsQueueAtom)
  const newOperations = operations.filter((o) => o.id !== operation.id)

  store.set(operationsQueueAtom, newOperations)
}
