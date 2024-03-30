import { useCorbadoSession } from '@corbado/react'
import { useLocation, Navigate } from 'react-router-dom'

// https://www.robinwieruch.de/react-router-authentication/
export const ProtectedRoute = ({ children }) => {
  const { loading, isAuthenticated, user } = useCorbadoSession()
  const location = useLocation()

  console.warn('ProtectedRoute', { loading, isAuthenticated, user })

  if (loading) {
    return <div>Loading...</div>
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/auth" replace state={{ from: location }} />
  }

  return children
}
