import { useEffect, useRef } from 'react'
import { useAtom, useAtomValue } from 'jotai'
import { useBeforeunload } from 'react-beforeunload'

import { isOnline } from '../modules/isOnline.ts'
import { onlineAtom, shortTermOnlineAtom, postgrestClientAtom } from '../store.ts'

const pollInterval = 5000

export const ApiDetector = () => {
  const [online, setOnline] = useAtom(onlineAtom)
  const [shortTermOnline, setShortTermOnline] = useAtom(shortTermOnlineAtom)
  const postgrestClient = useAtomValue(postgrestClientAtom)

  const isActiveRef = useRef(true)
  const pollingIdRef = useRef<NodeJS.Timeout | null>(null)

  useBeforeunload(() => {
    // console.log('ApiDetector stopping API polling')
    isActiveRef.current = false
    if (pollingIdRef.current) {
      clearInterval(pollingIdRef.current)
    }
  })

  useEffect(() => {
    pollingIdRef.current = setInterval(() => {
      isOnline().then((nowOnline) => {
        if (!isActiveRef.current) return

        const nowOnlineWithClient = nowOnline && !!postgrestClient
        if (online !== nowOnlineWithClient) {
          setOnline(nowOnlineWithClient)
        }
        if (shortTermOnline !== nowOnline) {
          setShortTermOnline(nowOnline)
        }
      })
    }, pollInterval)
  }, [online, postgrestClient, setOnline, setShortTermOnline, shortTermOnline])

  return null
}
