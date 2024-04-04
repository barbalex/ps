import { useEffect } from 'react'
import { useCorbadoSession } from '@corbado/react'

export const UserSetter = ({ setUser }) => {
  const { user } = useCorbadoSession()

  useEffect(() => {
    console.log('hello UserSetter setting user to:', user)
    setUser(user)
  }, [setUser, user])

  return null
}
