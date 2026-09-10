// Netlify proxy rewrites (_redirects, status 200) do not forward the
// original host to the upstream. The auth server resolves its base URL per
// request from x-forwarded-host (better-auth dynamic baseURL) so OAuth
// callbacks return to the origin the sign-in started from — without this
// header, arten-fördern.ch logins would be issued for the .app host and
// the session cookie would land on the wrong domain.

export default async (request, context) => {
  const url = new URL(request.url)
  const headers = new Headers(request.headers)
  headers.set('x-forwarded-host', url.host)
  headers.set('x-forwarded-proto', 'https')
  return context.next(new Request(request, { headers }))
}

export const config = { path: '/auth/*' }
