import { operationsQueueAtom } from '../store.ts'

export const removeOperation = ({ set, operation }) => {
  const operations = get(operationsQueueAtom)
  const newOperations = operations.filter((o) => o.id !== operation.id)
  set(operationsQueueAtom, newOperations)
}
