import { useEffect, useRef } from 'react'
import { useBeforeunload } from 'react-beforeunload'

import { observeOperations } from '../modules/observeOperations.ts'

export const OperationsObserver = () => {
  const unobserveRef = useRef({ current: null as null | (() => void) })

  useBeforeunload(() => {
    // console.log('OperationsObserver stopping observation of operations')
    unobserveRef.current?.()
    unobserveRef.current = null
  })

  useEffect(() => {
    unobserveRef.current = observeOperations()
  }, [])

  return null
}
