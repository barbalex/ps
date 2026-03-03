// import { useCorbado } from '@corbado/react'
import { Loading } from './shared/Loading.tsx'

import { Auth } from './Auth.tsx'
import { useSession } from '../modules/authClient.ts'

// https://www.robinwieruch.de/react-router-authentication/
export const ProtectedRoute = ({ children }) => {
  // const { loading, isAuthenticated } = useCorbado()
  // console.log('hello ProtectedRoute', { loading, isAuthenticated })
  const { data: session, isPending, error } = useSession()
  console.log('ProtectedRoute, session data:', { session, isPending, error })

  //TODO: get this working again
  if (isPending) return <Loading label="Authenticating" />

  // if (!isAuthenticated) return <Auth />
  // return <Auth />

  return children
}
