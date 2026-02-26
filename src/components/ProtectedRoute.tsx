// import { useCorbado } from '@corbado/react'
// import { Loading } from './shared/Loading.tsx'

import { Auth } from './Auth.tsx'
import { useSession } from '../modules/authClient.ts'

// https://www.robinwieruch.de/react-router-authentication/
export const ProtectedRoute = ({ children }) => {
  // const { loading, isAuthenticated } = useCorbado()
  // console.log('hello ProtectedRoute', { loading, isAuthenticated })
  const { data: session, isPending, error, refetch } = useSession()
  console.log('ProtectedRoute', { session, isPending, error, refetch })

  //TODO: get this working again
  // if (loading) return <Loading label="Authenticating" />

  // if (!isAuthenticated) return <Auth />

  return children
}
