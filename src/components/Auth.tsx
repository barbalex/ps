import { CorbadoAuth } from '@corbado/react'

export const Auth = () => (
  <CorbadoAuth
    onLoggedIn={() => console.log('hi')}
    customerSupportEmail="alex@gabriel-software.ch"
  />
)
