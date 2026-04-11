import { useEffect, useState } from 'react'
import { useIntl } from 'react-intl'

import { Loading } from './shared/Loading.tsx'

import { Auth } from './Auth.tsx'
import { getSession, useSession } from '../modules/authClient.ts'

type SessionLike = {
  user?: unknown
}

// https://www.robinwieruch.de/react-router-authentication/
export const ProtectedRoute = ({ children }) => {
  const { formatMessage } = useIntl()
  const { data: session, isPending, error } = useSession()
  const [isRevalidating, setIsRevalidating] = useState(false)
  const [revalidatedSession, setRevalidatedSession] = useState<
    SessionLike | null | undefined
  >(undefined)
  // console.log('ProtectedRoute, session data:', { session, isPending, error })

  useEffect(() => {
    const shouldRevalidate = !isPending && !error && !session?.user
    if (!shouldRevalidate) {
      setIsRevalidating(false)
      setRevalidatedSession(undefined)
      return
    }

    let isActive = true
    setIsRevalidating(true)

    const run = async () => {
      const maxAttempts = 4
      try {
        for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
          const result = await getSession({
            query: { disableCookieCache: true },
          })
          const normalizedSession =
            result && typeof result === 'object' && 'data' in result
              ? (result as { data?: SessionLike | null }).data
              : (result as SessionLike | null)

          if (normalizedSession?.user) {
            if (isActive) setRevalidatedSession(normalizedSession)
            return
          }

          if (attempt < maxAttempts - 1) {
            await new Promise((resolve) => setTimeout(resolve, 350))
          }
        }

        if (isActive) setRevalidatedSession(null)
      } catch {
        if (isActive) setRevalidatedSession(null)
      } finally {
        if (isActive) setIsRevalidating(false)
      }
    }

    run()

    return () => {
      isActive = false
    }
  }, [error, isPending, session?.user])

  const effectiveSession = session ?? revalidatedSession

  //TODO: get this working again
  if (isPending || isRevalidating)
    return (
      <Loading
        label={formatMessage({
          id: 'protectedRouteAuthenticating',
          defaultMessage: 'Authentifizierung...',
        })}
      />
    )

  if (error || !effectiveSession?.user) return <Auth />

  return children
}
