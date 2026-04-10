import { useEffect } from 'react'
import { useSession } from '../modules/authClient.ts'

const subKey = 'sub'

export const SessionStorageSetter = () => {
  const { data: session } = useSession()
  const shortSession = session?.user?.id

  useEffect(() => {
    if (!shortSession) {
      window.sessionStorage.removeItem(subKey)
      return
    }

    window.sessionStorage.setItem(subKey, shortSession)
  }, [shortSession])

  return null
}
