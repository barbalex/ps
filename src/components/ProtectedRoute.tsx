import { memo } from 'react'
import { useCorbado } from '@corbado/react'
import { Loading } from './shared/Loading'

import { Auth } from './Auth'

// https://www.robinwieruch.de/react-router-authentication/
export const ProtectedRoute = memo(({ children }) => {
  const { loading, isAuthenticated } = useCorbado()
  console.log('hello ProtectedRoute', { loading, isAuthenticated })

  if (loading) return <Loading label="Authenticating" />

  if (!isAuthenticated) return <Auth />

  return children
})
