import { CorbadoAuth } from '@corbado/react'
import { useNavigate } from '@tanstack/react-router'

export const Auth = () => {
  const navigate = useNavigate()

  const onLoggedIn = () => {
    navigate('/data/projects')
  }

  return (
    <CorbadoAuth
      onLoggedIn={onLoggedIn}
      customerSupportEmail="alex@gabriel-software.ch"
    />
  )
}
