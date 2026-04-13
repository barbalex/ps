import { createAuthClient } from 'better-auth/react'
import { emailOTPClient, twoFactorClient } from 'better-auth/client/plugins'
import { languageAtom, store, type Language } from '../store.ts'

const DEFAULT_LANGUAGE: Language = 'de'

export const getCurrentAppLanguage = (): Language => {
  const languageFromStore = store.get(languageAtom)
  if (languageFromStore) return languageFromStore

  return DEFAULT_LANGUAGE
}

export const getAuthRequestHeaders = (headers?: HeadersInit): Headers => {
  const resolvedHeaders = new Headers(headers)
  resolvedHeaders.set('x-app-language', getCurrentAppLanguage())
  return resolvedHeaders
}

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
    customFetchImpl: async (url, init) =>
      fetch(url, {
        ...init,
        headers: getAuthRequestHeaders(init?.headers),
      }),
  },
  plugins: [emailOTPClient(), twoFactorClient()],
})

export const { signIn, signUp, signOut, useSession, getSession, emailOtp } =
  authClient
