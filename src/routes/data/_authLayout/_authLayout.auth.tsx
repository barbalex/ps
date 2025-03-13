import { memo } from 'react'
import { CorbadoAuth } from '@corbado/react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'

export const Route = createFileRoute('/data/_authLayout/_authLayout/auth')({
  component: Component,
})

const Component = memo(() => {
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
})
