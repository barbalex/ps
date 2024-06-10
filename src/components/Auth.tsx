import { memo } from 'react'
import { CorbadoAuth } from '@corbado/react'

export const Auth = memo(() => (
  <CorbadoAuth
    onLoggedIn={() => console.log('you are now logged in')}
    customerSupportEmail="alex@gabriel-software.ch"
  />
))
