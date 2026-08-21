import { shortTermOnlineAtom, store } from '../store.ts'

// not a hook: set the jotai store directly so this works outside components too
export const setShortTermOnlineFromFetchError = (error: unknown) => {
  if (error?.message?.includes?.('Failed to fetch')) {
    console.log('checkForOfflineError, network is failing')
    store.set(shortTermOnlineAtom, false)
  }
}
