export type SignInErrorKind = 'credentials' | 'unverified' | 'other'

type AuthError = { code?: string; message?: string } | null | undefined

/**
 * better-auth answers an unknown email and a wrong password with the same
 * INVALID_EMAIL_OR_PASSWORD, so that the existence of an account stays
 * private. A form must therefore never claim to know which of the two was
 * wrong. Only "email not verified" carries a next step for the user.
 */
export const getSignInErrorKind = (error: AuthError): SignInErrorKind => {
  const code = (error?.code ?? '').toUpperCase()
  const message = (error?.message ?? '').toLowerCase()

  if (
    code === 'EMAIL_NOT_VERIFIED' ||
    message.includes('email is not verified')
  ) {
    return 'unverified'
  }

  if (
    code === 'INVALID_EMAIL_OR_PASSWORD' ||
    message.includes('invalid email or password') ||
    message.includes('invalid credentials') ||
    message.includes('user not found')
  ) {
    return 'credentials'
  }

  return 'other'
}
