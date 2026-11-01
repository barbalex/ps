import { getAuthBaseUrl } from './authClient.ts'

interface TokenCache {
  token: string
  userId: string | null
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

const decodePayload = (token: string) => {
  const [, payloadB64] = token.split('.')
  return JSON.parse(
    atob(payloadB64!.replace(/-/g, '+').replace(/_/g, '/')),
  ) as { exp: number; user_id?: string }
}

/**
 * Returns a PostgREST/Electric JWT for the signed-in user. When forUserId is
 * given, a cached token issued for another user (account switch in the same
 * tab) is discarded and the fresh token must carry that user id — Electric
 * shape requests are rejected server-side when params[1] is not the caller.
 */
export const fetchPostgrestToken = async (
  forUserId?: string,
): Promise<string | null> => {
  if (cache && forUserId && cache.userId !== forUserId) cache = null
  if (cache && !isExpired(cache)) return cache.token
  if (inflightPromise) return inflightPromise

  inflightPromise = (async () => {
    try {
      // no-store: the browser must not serve another account's token
      const res = await fetch(`${getAuthBaseUrl()}/auth/postgrest-token`, {
        credentials: 'include',
        cache: 'no-store',
      })
      if (!res.ok) return null
      const { token } = (await res.json()) as { token: string }
      // Decode exp from JWT payload (no signature verification needed — we trust our own server)
      const payload = decodePayload(token)
      if (forUserId && payload.user_id !== forUserId) {
        console.warn(
          'fetchPostgrestToken: token issued for another user than the session',
        )
        return null
      }
      cache = {
        token,
        userId: payload.user_id ?? null,
        expiresAt: payload.exp * 1000,
      }
      return token
    } catch {
      return null
    } finally {
      inflightPromise = null
    }
  })()

  return inflightPromise
}
