import { observe } from 'jotai-effect'

import { operationsQueueAtom } from '../store.ts'

// returns unobserve function
// https://jotai.org/docs/extensions/effect
export const observeOperations = (store) =>
  observe((get, set) => {
    console.log(
      `operationsQueueAtom changed: ${JSON.stringify(get(operationsQueueAtom))}`,
    )
  }, store)
