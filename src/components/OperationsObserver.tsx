import { useEffect } from 'react'

import { observeOperations } from '../modules/observeOperations.ts'
import { store } from '../store.ts'

export const OperationsObserver = () => {
  useEffect(() => {
    // console.log('OperationsObserver observing operations')
    const unobserve = observeOperations(store)

    return () => {
      console.log('OperationsObserver unobserving operations')
      unobserve()
    }
  }, [])

  return null
}
