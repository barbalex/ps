import { CorbadoAuth } from '@corbado/react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'

export const Route = createFileRoute('/data/auth')({
  component: Component,
})

const Component = () => {
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
