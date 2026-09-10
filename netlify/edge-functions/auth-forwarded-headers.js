// Same-origin proxy for arten-fördern.ch auth requests.
//
// Netlify's _redirects proxying does not forward the original host to the
// upstream, and headers set via context.next() are not reliably applied to
// the rewrite either — so this edge function performs the proxy itself and
// sets x-forwarded-host/-proto explicitly. The auth server resolves its
// base URL per request from those headers (better-auth dynamic baseURL),
// which makes OAuth callbacks return to the origin the sign-in started
// from and keeps the session cookie on the .ch domain.

const UPSTREAM = 'https://auth.xn--arten-frdern-bjb.app'

export default async (request) => {
  const url = new URL(request.url)
  const upstream = new URL(UPSTREAM + url.pathname + url.search)

  const headers = new Headers(request.headers)
  headers.set('x-forwarded-host', url.host)
  headers.set('x-forwarded-proto', 'https')
  headers.delete('host')

  const response = await fetch(upstream, {
    method: request.method,
    headers,
    body: ['GET', 'HEAD'].includes(request.method)
      ? undefined
      : await request.arrayBuffer(),
    redirect: 'manual',
  })

  // rebuild the response so multiple set-cookie headers survive the proxy
  const outHeaders = new Headers()
  response.headers.forEach((value, key) => {
    if (key !== 'set-cookie') outHeaders.append(key, value)
  })
  for (const cookie of response.headers.getSetCookie?.() ?? []) {
    outHeaders.append('set-cookie', cookie)
  }

  return new Response(response.body, {
    status: response.status,
    headers: outHeaders,
  })
}

export const config = { path: '/auth/*' }
