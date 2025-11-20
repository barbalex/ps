import { useEffect } from 'react'
import { useCorbado } from '@corbado/react'

import { subKey } from '../auth.ts'

export const SessionStorageSetter = () => {
  const { shortSession } = useCorbado()

  useEffect(() => {
    if (!shortSession) return

    console.log('hello SessionStorageSetter, new shortSession:', shortSession)
    window.sessionStorage.setItem(subKey, shortSession)
  }, [shortSession])

  return null
}
