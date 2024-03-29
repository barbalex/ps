// AuthPage.js
import { CorbadoAuth } from '@corbado/react'
import { useNavigate } from 'react-router-dom'

export const Component = () => {
  const navigate = useNavigate()

  const onLoggedIn = () => {
    navigate('/')
  }

  return <CorbadoAuth onLoggedIn={onLoggedIn} />
}
