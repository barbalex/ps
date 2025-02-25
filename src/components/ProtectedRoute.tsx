import { memo } from 'react'
import { useCorbado } from '@corbado/react'
import { Loading } from './shared/Loading.tsx'

import { Auth } from './Auth.tsx'

// https://www.robinwieruch.de/react-router-authentication/
export const ProtectedRoute = memo(({ children }) => {
  const { loading, isAuthenticated } = useCorbado()
  // console.log('hello ProtectedRoute', { loading, isAuthenticated })

  //TODO: get this working again
  // if (loading) return <Loading label="Authenticating" />

  // if (!isAuthenticated) return <Auth />

  return children
})
