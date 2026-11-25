import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

// the token fetch needs only the auth server's base url — better-auth's
// client (and the store it pulls in) stays out of the test
vi.mock('../src/modules/authClient.ts', () => ({
  getAuthBaseUrl: () => 'http://auth.test',
}))

/**
 * The client side of apply_operations. Sent without a JWT, PostgREST runs the
 * function as web_anon and denies it ("permission denied for function
 * apply_operations") — so a missing token must keep the batch queued instead.
 */

const USER = '11111111-1111-4111-1111-111111111111'
const TOKEN = `${Buffer.from('{"alg":"HS256"}').toString('base64url')}.${Buffer.from(
  JSON.stringify({ role: 'app_user', user_id: USER, exp: 4_102_444_800 }),
).toString('base64url')}.signature`

const fetchMock = vi.fn<typeof fetch>()
// a Response body can be read once: every call gets its own
const serve = (response: () => Response) =>
  fetchMock.mockImplementation(() => Promise.resolve(response()))

const load = async () => {
  vi.resetModules()
  const [{ store, postgrestClientAtom }, { applyOperations }] =
    await Promise.all([
      import('../src/store.ts'),
      import('../src/modules/applyOperations.ts'),
    ])
  return { store, postgrestClientAtom, applyOperations }
}

const operation = {
  id: 'op-1',
  time: '2026-11-24T21:15:51.000Z',
  table: 'wfs_services',
  rowIdName: 'wfs_service_id',
  rowId: '01a20f6a-3f83-71e0-913a-d5fc838ddc1e',
  operation: 'upsert',
  draft: { url: 'https://maps.zh.ch/wfs/OGDZHWFS' },
} as never

describe('applyOperations (client)', () => {
  beforeEach(() => {
    fetchMock.mockReset()
    vi.stubGlobal('fetch', fetchMock)
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('sends the batch with the token', async () => {
    serve(() => new Response(JSON.stringify({ token: TOKEN }), { status: 200 }))
    const { store, postgrestClientAtom, applyOperations } = await load()
    // postgrest-js: rpc returns a builder that carries the headers and,
    // awaited, resolves to the response
    const builder = {
      headers: new Headers(),
      setHeader(name: string, value: string) {
        this.headers.set(name, value)
        return this
      },
      then: (resolve: (value: unknown) => void) =>
        resolve({
          data: [{ op_index: 0, status: 'applied', detail: '1 rows' }],
          error: null,
        }),
    }
    const rpc = vi.fn(() => builder)

    store.set(postgrestClientAtom, { rpc } as never)
    const results = await applyOperations([operation])

    expect(fetchMock).toHaveBeenCalledTimes(1)
    expect(rpc).toHaveBeenCalledWith('apply_operations', {
      p_operations: [
        expect.objectContaining({
          table: 'wfs_services',
          operation: 'upsert',
          rowId: '01a20f6a-3f83-71e0-913a-d5fc838ddc1e',
        }),
      ],
    })
    expect(builder.headers.get('Authorization')).toBe(`Bearer ${TOKEN}`)
    expect(results).toEqual([
      { op_index: 0, status: 'applied', detail: '1 rows' },
    ])
  })

  it('keeps the batch queued instead of sending it without a token', async () => {
    serve(
      () =>
        new Response(JSON.stringify({ error: 'RATE_LIMITED' }), {
          status: 429,
          headers: { 'Retry-After': '600' },
        }),
    )
    const { store, postgrestClientAtom, applyOperations } = await load()
    const rpc = vi.fn()

    store.set(postgrestClientAtom, { rpc } as never)
    const error = await applyOperations([operation]).catch((e: unknown) => e)

    expect(error).toMatchObject({
      code: 'PS_TOKEN_UNAVAILABLE',
      reason: 'rate-limited',
    })
    expect(rpc).not.toHaveBeenCalled()
  })
})
