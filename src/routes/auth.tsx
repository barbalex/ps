import { CorbadoAuth } from '@corbado/react'
import { useNavigate } from 'react-router-dom'

export const Component = () => {
  const navigate = useNavigate()

  const onLoggedIn = () => {
    navigate('/projects')
  }

  return (
    <CorbadoAuth
      onLoggedIn={onLoggedIn}
      customerSupportEmail="alex@gabriel-software.ch"
    />
  )
}
