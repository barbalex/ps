// import { useCorbado } from '@corbado/react'
import { useIntl } from 'react-intl'

import { Loading } from './shared/Loading.tsx'

import { Auth } from './Auth.tsx'
import { useSession } from '../modules/authClient.ts'

// https://www.robinwieruch.de/react-router-authentication/
export const ProtectedRoute = ({ children }) => {
  const { formatMessage } = useIntl()
  // const { loading, isAuthenticated } = useCorbado()
  // console.log('hello ProtectedRoute', { loading, isAuthenticated })
  const { data: session, isPending, error } = useSession()
  // console.log('ProtectedRoute, session data:', { session, isPending, error })

  //TODO: get this working again
  if (isPending)
    return (
      <Loading
        label={formatMessage({
          id: 'protectedRouteAuthenticating',
          defaultMessage: 'Authentifizierung...',
        })}
      />
    )

  if (error || !session?.user) return <Auth />

  return children
}
