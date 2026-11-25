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

/** why the last attempt found no token */
export type PostgrestTokenUnavailableReason =
  'rate-limited' | 'unauthorized' | 'server' | 'network' | 'user-mismatch'

/**
 * There is no token to authenticate a request with. requirePostgrestToken
 * throws it so the caller keeps its request instead of sending it without a
 * JWT: PostgREST would run that as web_anon, whose denial ("permission
 * denied for function apply_operations") reads like a missing role.
 */
export class PostgrestTokenUnavailableError extends Error {
  code = 'PS_TOKEN_UNAVAILABLE'
  reason: PostgrestTokenUnavailableReason

  constructor(reason: PostgrestTokenUnavailableReason) {
    super(`no auth token available (${reason})`)
    this.reason = reason
  }
}

// matched by its code rather than instanceof, so a catcher works with the
// value alone
export const isPostgrestTokenUnavailableError = (
  error: unknown,
): error is PostgrestTokenUnavailableError =>
  (error as { code?: unknown } | null)?.code === 'PS_TOKEN_UNAVAILABLE'

// A failed attempt leaves nothing to cache, so every caller asked the auth
// server again — and a page has many callers at once while the token is
// missing: one per synced table, each retrying on its own backoff. That made
// several requests per second and kept the auth server's rate limit (in dev
// one bucket for all local clients) exhausted for everyone. So wait after a
// failure: doubling from 2 s up to a minute, and on a 429 at least as long
// as the server says its budget is back.
let failures = 0
let retryAt = 0
let lastFailureReason: PostgrestTokenUnavailableReason = 'network'
const BACKOFF_MIN_MS = 2_000
const BACKOFF_MAX_MS = 60_000
// offline, the attempts cost the auth server nothing and coming back online
// must not wait out a minute
const OFFLINE_BACKOFF_MAX_MS = 5_000
// longer than the auth server's 15 minute window a 429 is never right
const RATE_LIMIT_WAIT_MAX_MS = 16 * 60_000

// Retry-After or the standard RateLimit-Reset: seconds — but only readable
// when the auth server exposes them via CORS
const serverWaitMs = (res: Response) => {
  for (const header of ['retry-after', 'ratelimit-reset']) {
    const seconds = Number(res.headers.get(header))
    if (Number.isFinite(seconds) && seconds > 0) {
      return Math.min(seconds * 1000, RATE_LIMIT_WAIT_MAX_MS)
    }
  }
  return 0
}

const noteFailure = (
  reason: PostgrestTokenUnavailableReason,
  res?: Response,
) => {
  failures += 1
  lastFailureReason = reason
  const maxWait = reason === 'network' ? OFFLINE_BACKOFF_MAX_MS : BACKOFF_MAX_MS
  retryAt =
    Date.now() +
    Math.max(
      Math.min(maxWait, BACKOFF_MIN_MS * 2 ** (failures - 1)),
      res ? serverWaitMs(res) : 0,
    )
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
  // a recent attempt failed: wait instead of asking again
  if (retryAt > Date.now()) return null

  inflightPromise = (async () => {
    try {
      // no-store: the browser must not serve another account's token
      const res = await fetch(`${getAuthBaseUrl()}/auth/postgrest-token`, {
        credentials: 'include',
        cache: 'no-store',
      })
      if (!res.ok) {
        noteFailure(
          res.status === 429 ? 'rate-limited'
          : res.status === 401 ? 'unauthorized'
          : 'server',
          res,
        )
        return null
      }
      const { token } = (await res.json()) as { token: string }
      // Decode exp from JWT payload (no signature verification needed — we trust our own server)
      const payload = decodePayload(token)
      if (forUserId && payload.user_id !== forUserId) {
        console.warn(
          'fetchPostgrestToken: token issued for another user than the session',
        )
        noteFailure('user-mismatch')
        return null
      }
      cache = {
        token,
        userId: payload.user_id ?? null,
        expiresAt: payload.exp * 1000,
      }
      failures = 0
      retryAt = 0
      return token
    } catch {
      noteFailure('network')
      return null
    } finally {
      inflightPromise = null
    }
  })()

  return inflightPromise
}

/**
 * Like fetchPostgrestToken, but throws when there is no token — for requests
 * that must not go out anonymously.
 */
export const requirePostgrestToken = async (forUserId?: string) => {
  const token = await fetchPostgrestToken(forUserId)
  if (!token) throw new PostgrestTokenUnavailableError(lastFailureReason)
  return token
}
