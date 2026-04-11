import { createAuthClient } from 'better-auth/react'

const getProductionAuthBaseUrl = () => {
  const host = window?.location?.hostname?.toLowerCase() ?? ''
  if (host.endsWith('promote-species.app')) {
    return 'https://auth.promote-species.app'
  }
  return 'https://auth.xn--arten-frdern-bjb.app'
}

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
      : getProductionAuthBaseUrl(),
    basePath: '/auth',
    fetchOptions: {
      credentials: 'include',
    },
  })
