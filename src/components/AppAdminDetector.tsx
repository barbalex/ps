import { useEffect } from 'react'
import { useSetAtom } from 'jotai'
import { useLocation } from '@tanstack/react-router'

import { useSession } from '../modules/authClient.ts'
import { isAppAdminEmail } from '../modules/appAdmins.ts'
import { isAppAmin } from '../store.ts'

export const AppAdminDetector = () => {
  const { data: session } = useSession()
  const { pathname } = useLocation()
  const setIsAppAmin = useSetAtom(isAppAmin)

  console.log('AppAdminDetector session email:', session?.user?.email)

  useEffect(() => {
    setIsAppAmin(isAppAdminEmail(session?.user?.email))
  }, [pathname, session?.user?.email, setIsAppAmin])

  return null
}
