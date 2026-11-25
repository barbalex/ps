import { describe, expect, it } from 'vitest'

import { wfsRequestVersion } from '../src/modules/wfsRequestVersion.ts'

/**
 * WFS has the versions 1.0.0, 1.1.0 and 2.0.0. A service without a stored version
 * used to be asked for "1.3.0" — which MapServer refuses ("WFS Server does not
 * support VERSION 1.3.0"). Leaving the version away does not do either ("Incomplete
 * WFS request: VERSION parameter missing"), so it falls back to 1.1.0.
 */
describe('wfsRequestVersion', () => {
  it('passes the version of the service on', () => {
    expect(wfsRequestVersion('2.0.0')).toBe('2.0.0')
    expect(wfsRequestVersion('1.1.0')).toBe('1.1.0')
    expect(wfsRequestVersion('1.0.0')).toBe('1.0.0')
  })

  it('asks in 1.1.0 when the service has no version', () => {
    expect(wfsRequestVersion(null)).toBe('1.1.0')
    expect(wfsRequestVersion(undefined)).toBe('1.1.0')
    expect(wfsRequestVersion('')).toBe('1.1.0')
  })
})
