import { getAuthBaseUrl } from './authClient.ts'

interface TokenCache {
  token: string
  expiresAt: number
}

let cache: TokenCache | null = null
let inflightPromise: Promise<string | null> | null = null

const isExpired = (c: TokenCache) =>
  // Refresh 2 minutes before actual expiry
  Date.now() >= c.expiresAt - 120_000

export const invalidatePostgrestToken = () => {
  cache = null
}

export const fetchPostgrestToken = async (): Promise<string | null> => {
  if (cache && !isExpired(cache)) return cache.token
  if (inflightPromise) return inflightPromise

  inflightPromise = (async () => {
    try {
      const res = await fetch(`${getAuthBaseUrl()}/auth/postgrest-token`, {
        credentials: 'include',
      })
      if (!res.ok) return null
      const { token } = (await res.json()) as { token: string }
      // Decode exp from JWT payload (no signature verification needed — we trust our own server)
      const [, payloadB64] = token.split('.')
      const payload = JSON.parse(
        atob(payloadB64.replace(/-/g, '+').replace(/_/g, '/')),
      ) as { exp: number }
      cache = { token, expiresAt: payload.exp * 1000 }
      return token
    } catch {
      return null
    } finally {
      inflightPromise = null
    }
  })()

  return inflightPromise
}
