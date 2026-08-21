import { useEffect, useRef } from 'react'
import { useBeforeunload } from 'react-beforeunload'

import { observeOperations } from '../modules/observeOperations.ts'
import { operationsRetryTickAtom, store } from '../store.ts'

export const OperationsObserver = () => {
  const unobserveRef = useRef({ current: null as null | (() => void) })

  useBeforeunload(() => {
    // console.log('OperationsObserver stopping observation of operations')
    unobserveRef.current?.()
    unobserveRef.current = null
  })

  useEffect(() => {
    unobserveRef.current = observeOperations()

    // Re-run the observer periodically: a reconnect can be missed when it
    // happens while a failed operation is still retrying in-flight
    const retryInterval = setInterval(() => {
      store.set(operationsRetryTickAtom, Date.now())
    }, 10_000)

    return () => {
      clearInterval(retryInterval)
    }
  }, [])

  return null
}
