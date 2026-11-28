import { describe, expect, it } from 'vitest'

import { getSignInErrorKind } from '../src/modules/signInError.ts'

describe('getSignInErrorKind', () => {
  it('treats an unknown email and a wrong password alike', () => {
    expect(
      getSignInErrorKind({
        code: 'INVALID_EMAIL_OR_PASSWORD',
        message: 'Invalid email or password',
      }),
    ).toBe('credentials')
    expect(getSignInErrorKind({ message: 'Invalid email or password' })).toBe(
      'credentials',
    )
  })

  it('recognises an address that was not confirmed yet', () => {
    expect(
      getSignInErrorKind({
        code: 'EMAIL_NOT_VERIFIED',
        message: 'Email is not verified',
      }),
    ).toBe('unverified')
    expect(getSignInErrorKind({ message: 'Email is not verified' })).toBe(
      'unverified',
    )
  })

  it('leaves everything else to the server message', () => {
    expect(
      getSignInErrorKind({
        code: 'RATE_LIMITED',
        message: 'Too many requests',
      }),
    ).toBe('other')
    expect(getSignInErrorKind(null)).toBe('other')
    expect(getSignInErrorKind(undefined)).toBe('other')
  })
})
