import { useEffect } from 'react'
import { useAtom } from 'jotai'

import { isOnline } from '../modules/isOnline.ts'
import { onlineAtom, shortTermOnlineAtom } from '../store.ts'

const pollInterval = 5000

export const ApiDetector = () => {
  const [online, setOnline] = useAtom(onlineAtom)
  const [shortTermOnline, setShortTermOnline] = useAtom(shortTermOnlineAtom)

  useEffect(() => {
    let isActive = true
    const pollingId = setInterval(() => {
      isOnline().then((nowOnline) => {
        if (!isActive) return

        if (online !== nowOnline) {
          setOnline(nowOnline)
        }
        if (shortTermOnline !== nowOnline) {
          setShortTermOnline(nowOnline)
        }
      })
    }, pollInterval)

    return () => {
      isActive = false
      clearInterval(pollingId)
    }
  }, [online, setOnline, setShortTermOnline, shortTermOnline])

  return null
}
