import { createAuthClient } from 'better-auth/react'

const PRODUCTION_AUTH_BASE_URL = 'https://auth.promote-species.app'

const isLocalDevHost = () => {
  const host = window?.location?.hostname
  return (
    host === 'localhost' ||
    host === '127.0.0.1' ||
    host === '::1' ||
    host === '[::1]'
  )
}

export const { signIn, signUp, signOut, useSession, getSession } =
  createAuthClient({
    /** The base URL of the server (optional if you're using the same domain) */
    baseURL: isLocalDevHost()
      ? 'http://localhost:3003'
      : PRODUCTION_AUTH_BASE_URL,
    basePath: '/auth',
    fetchOptions: {
      credentials: 'include',
    },
  })
