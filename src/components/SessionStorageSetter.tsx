import { useEffect } from 'react'
import { useCorbadoSession } from '@corbado/react'

import { subKey } from '../auth'

export const SessionStorageSetter = () => {
  const { shortSession } = useCorbadoSession()

  // TODO: move this to own component
  useEffect(() => {
    if (!shortSession) return
    window.sessionStorage.setItem(subKey, shortSession)
  }, [shortSession])

  return null
}
