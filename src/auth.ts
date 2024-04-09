import { insecureAuthToken } from 'electric-sql/auth'
import { genUUID } from 'electric-sql/util'

export const subKey = '__electric_sub'

// Generate an insecure authentication JWT.
// See https://electric-sql.com/docs/usage/auth for more details.
export const authToken = () => {
  let sub = window.sessionStorage.getItem(subKey)
  if (!sub) {
    // This is just a demo. In a real app, the user ID would
    // usually come from somewhere else :)
    sub = genUUID()
    window.sessionStorage.setItem(subKey, sub)
  }
  const claims = { sub }
  return insecureAuthToken(claims)
}
