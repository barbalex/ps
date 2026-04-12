import { createAuthClient } from 'better-auth/react'
import { emailOTPClient } from 'better-auth/client/plugins'

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

export const getAuthBaseUrl = () =>
  isLocalDevHost() ? 'http://localhost:3003' : getProductionAuthBaseUrl()

export const authClient = createAuthClient({
  /** The base URL of the server (optional if you're using the same domain) */
  baseURL: getAuthBaseUrl(),
  basePath: '/auth',
  fetchOptions: {
    credentials: 'include',
  },
  plugins: [emailOTPClient()],
})

export const { signIn, signUp, signOut, useSession, getSession, emailOtp } =
  authClient
