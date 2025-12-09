import { useSetAtom } from 'jotai'

import { shortTermOnlineAtom } from '../store.ts'

// better name: setShortTermOnlineFromFetchError
export const setShortTermOnlineFromFetchError = (error) => {
  const setShortTermOnline = useSetAtom(shortTermOnlineAtom)

  if (error?.message?.includes?.('Failed to fetch')) {
    console.log('checkForOfflineError, network is failing')
    return setShortTermOnline(false)
  }
}
