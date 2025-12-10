import { operationsQueueAtom, store } from '../store.ts'

export const removeOperation = (operation) => {
  const operations = store.get(operationsQueueAtom)
  const newOperations = operations.filter((o) => o.id !== operation.id)

  store.set(operationsQueueAtom, newOperations)
}
