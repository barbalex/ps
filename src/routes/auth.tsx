import { memo } from 'react'
import { CorbadoAuth } from '@corbado/react'
import { useNavigate } from 'react-router'

export const Component = memo(() => {
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
