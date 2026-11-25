import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

// the token fetch needs only the auth server's base url — better-auth's
// client (and the store it pulls in) stays out of the test
vi.mock('../src/modules/authClient.ts', () => ({
  getAuthBaseUrl: () => 'http://auth.test',
}))

/**
 * fetchPostgrestToken keeps its cache in module state, so every test starts
 * from a fresh instance of the module.
 */

const USER = '11111111-1111-4111-1111-111111111111'
const OTHER_USER = '22222222-2222-4222-8222-222222222222'
// 2100-01-01: the token must not expire while the tests advance the clock
const EXPIRES_AT = 4_102_444_800

const base64url = (value: object) =>
  Buffer.from(JSON.stringify(value)).toString('base64url')

// with the claims the auth server signs (backend-dev/auth/server.mjs)
const tokenFor = (userId: string) =>
  `${base64url({ alg: 'HS256', typ: 'JWT' })}.${base64url({
    role: 'app_user',
    user_id: userId,
    exp: EXPIRES_AT,
  })}.signature`

const ok = (userId = USER) =>
  new Response(JSON.stringify({ token: tokenFor(userId) }), { status: 200 })
const failing = () => new Response('', { status: 500 })
const rateLimited = (resetInSeconds?: number) =>
  new Response(JSON.stringify({ error: 'RATE_LIMITED' }), {
    status: 429,
    headers:
      resetInSeconds == null ? {} : { 'Retry-After': String(resetInSeconds) },
  })

const fetchMock = vi.fn<typeof fetch>()
// a Response body can be read once: every call gets its own
const serve = (...responses: (() => Response)[]) => {
  if (responses.length === 1) {
    fetchMock.mockImplementation(() => Promise.resolve(responses[0]!()))
  } else {
    fetchMock.mockReset()
    for (const response of responses) {
      fetchMock.mockImplementationOnce(() => Promise.resolve(response()))
    }
  }
}

const load = async () => {
  vi.resetModules()
  return import('../src/modules/fetchPostgrestToken.ts')
}

beforeEach(() => {
  vi.useFakeTimers()
  vi.stubGlobal('fetch', fetchMock)
})

afterEach(() => {
  vi.unstubAllGlobals()
  vi.useRealTimers()
})

describe('fetchPostgrestToken', () => {
  it('asks the auth server once and serves the token from its cache', async () => {
    serve(ok)
    const { fetchPostgrestToken } = await load()

    const first = await fetchPostgrestToken()
    const second = await fetchPostgrestToken()

    expect(first).toBe(tokenFor(USER))
    expect(second).toBe(first)
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it('shares one request between concurrent callers', async () => {
    let respond: (res: Response) => void = () => undefined
    fetchMock.mockReturnValue(
      new Promise<Response>((resolve) => {
        respond = resolve
      }),
    )
    const { fetchPostgrestToken } = await load()

    const calls = Array.from({ length: 5 }, () => fetchPostgrestToken())
    respond(ok())
    const tokens = await Promise.all(calls)

    expect(new Set(tokens).size).toBe(1)
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it('returns null on a failure and does not ask again at once', async () => {
    serve(failing, ok)
    const { fetchPostgrestToken } = await load()

    expect(await fetchPostgrestToken()).toBeNull()
    expect(await fetchPostgrestToken()).toBeNull()
    expect(fetchMock).toHaveBeenCalledTimes(1)

    vi.advanceTimersByTime(2_000)
    expect(await fetchPostgrestToken()).toBe(tokenFor(USER))
    expect(fetchMock).toHaveBeenCalledTimes(2)
  })

  it('doubles the wait after a failure, up to a minute', async () => {
    serve(failing)
    const { fetchPostgrestToken } = await load()

    // waits: 2 s, 4 s, 8 s, 16 s, 32 s, then the 60 s cap
    const waits = [2_000, 4_000, 8_000, 16_000, 32_000, 60_000, 60_000]
    for (const [attempt, wait] of waits.entries()) {
      expect(await fetchPostgrestToken()).toBeNull()
      expect(fetchMock).toHaveBeenCalledTimes(attempt + 1)

      vi.advanceTimersByTime(wait - 1)
      expect(await fetchPostgrestToken()).toBeNull()
      expect(fetchMock).toHaveBeenCalledTimes(attempt + 1)

      vi.advanceTimersByTime(1)
    }
  })

  it('waits at most 5 s while offline', async () => {
    fetchMock.mockRejectedValue(new TypeError('Failed to fetch'))
    const { fetchPostgrestToken } = await load()

    // waits: 2 s, 4 s, then the 5 s cap
    const waits = [2_000, 4_000, 5_000, 5_000]
    for (const [attempt, wait] of waits.entries()) {
      expect(await fetchPostgrestToken()).toBeNull()
      expect(fetchMock).toHaveBeenCalledTimes(attempt + 1)

      vi.advanceTimersByTime(wait - 1)
      expect(await fetchPostgrestToken()).toBeNull()
      expect(fetchMock).toHaveBeenCalledTimes(attempt + 1)

      vi.advanceTimersByTime(1)
    }
  })

  it('waits as long as a 429 says, when it says it', async () => {
    serve(() => rateLimited(120), ok)
    const { fetchPostgrestToken } = await load()

    expect(await fetchPostgrestToken()).toBeNull()
    vi.advanceTimersByTime(119_999)
    expect(await fetchPostgrestToken()).toBeNull()
    expect(fetchMock).toHaveBeenCalledTimes(1)

    vi.advanceTimersByTime(1)
    expect(await fetchPostgrestToken()).toBe(tokenFor(USER))
    expect(fetchMock).toHaveBeenCalledTimes(2)
  })

  it('starts over after a success', async () => {
    serve(failing, ok, failing)
    const { fetchPostgrestToken, invalidatePostgrestToken } = await load()

    expect(await fetchPostgrestToken()).toBeNull()
    vi.advanceTimersByTime(2_000)
    expect(await fetchPostgrestToken()).toBe(tokenFor(USER))

    // drop the cached token so the next call has to ask again: that failure
    // waits the initial 2 s again, not 4 s
    invalidatePostgrestToken()
    expect(await fetchPostgrestToken()).toBeNull()
    vi.advanceTimersByTime(2_000)
    await fetchPostgrestToken()
    expect(fetchMock).toHaveBeenCalledTimes(4)
  })

  it('rejects a token issued for another user without asking again at once', async () => {
    vi.spyOn(console, 'warn').mockImplementation(() => undefined)
    serve(() => ok(OTHER_USER))
    const { fetchPostgrestToken } = await load()

    expect(await fetchPostgrestToken(USER)).toBeNull()
    expect(await fetchPostgrestToken(USER)).toBeNull()
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })
})

describe('requirePostgrestToken', () => {
  let fresh: Awaited<ReturnType<typeof load>>
  beforeEach(async () => {
    fresh = await load()
  })

  it('returns the token when there is one', async () => {
    serve(ok)

    expect(await fresh.requirePostgrestToken()).toBe(tokenFor(USER))
  })

  it('throws instead of handing out nothing', async () => {
    serve(() => rateLimited())

    const error = await fresh.requirePostgrestToken().catch((e: unknown) => e)

    expect(fresh.isPostgrestTokenUnavailableError(error)).toBe(true)
    expect(error).toBeInstanceOf(fresh.PostgrestTokenUnavailableError)
    expect(error).toMatchObject({
      message: 'no auth token available (rate-limited)',
      code: 'PS_TOKEN_UNAVAILABLE',
      reason: 'rate-limited',
    })
  })

  it('names why there is no token', async () => {
    const cases: [() => Response, string][] = [
      [() => rateLimited(), 'rate-limited'],
      [() => new Response('', { status: 401 }), 'unauthorized'],
      [failing, 'server'],
    ]
    for (const [response, reason] of cases) {
      serve(response)
      const { requirePostgrestToken } = await load()

      await expect(requirePostgrestToken()).rejects.toMatchObject({
        code: 'PS_TOKEN_UNAVAILABLE',
        reason,
      })
    }

    fetchMock.mockRejectedValue(new TypeError('Failed to fetch'))
    const { requirePostgrestToken } = await load()
    await expect(requirePostgrestToken()).rejects.toMatchObject({
      reason: 'network',
    })
  })

  it('throws again within the backoff without asking the auth server', async () => {
    serve(() => rateLimited())

    await expect(fresh.requirePostgrestToken()).rejects.toThrow()
    await expect(fresh.requirePostgrestToken()).rejects.toThrow()
    expect(fetchMock).toHaveBeenCalledTimes(1)

    vi.advanceTimersByTime(2_000)
    await expect(fresh.requirePostgrestToken()).rejects.toThrow()
    expect(fetchMock).toHaveBeenCalledTimes(2)
  })

  it('passes only a token of the user it was asked for', async () => {
    vi.spyOn(console, 'warn').mockImplementation(() => undefined)
    serve(() => ok(OTHER_USER))

    const error = await fresh
      .requirePostgrestToken(USER)
      .catch((e: unknown) => e)
    expect(error).toMatchObject({
      code: 'PS_TOKEN_UNAVAILABLE',
      reason: 'user-mismatch',
    })

    vi.advanceTimersByTime(2_000)
    expect(await fresh.requirePostgrestToken(OTHER_USER)).toBe(
      tokenFor(OTHER_USER),
    )
  })
})
