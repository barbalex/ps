import { CorbadoAuth } from '@corbado/react'

export const Auth = () => (
  <CorbadoAuth
    onLoggedIn={() => console.log('you are now logged in')}
    customerSupportEmail="alex@gabriel-software.ch"
  />
)
