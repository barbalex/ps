import { operationsQueueAtom } from '../store.ts'

export const removeOperation = ({ get, set, operation }) => {
  const operations = get(operationsQueueAtom)
  const newOperations = operations.filter((o) => o.id !== operation.id)

  set(operationsQueueAtom, newOperations)
}
