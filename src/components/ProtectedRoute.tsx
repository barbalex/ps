// import { useCorbado } from '@corbado/react'
import { Loading } from './shared/Loading.tsx'

import { Auth } from './Auth.tsx'
import { useSession } from '../modules/authClient.ts'

// https://www.robinwieruch.de/react-router-authentication/
export const ProtectedRoute = ({ children }) => {
  // const { loading, isAuthenticated } = useCorbado()
  // console.log('hello ProtectedRoute', { loading, isAuthenticated })
  const sessionResult = useSession()
  const { data: session, isPending, error, refetch } = sessionResult
  console.log('ProtectedRoute, sessionResult:', sessionResult)

  //TODO: get this working again
  if (isPending) return <Loading label="Authenticating" />

  // if (!isAuthenticated) return <Auth />
  // return <Auth />

  return children
}
