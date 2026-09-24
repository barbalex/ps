import { describe, expect, it } from 'vitest'

import {
  asOfYear,
  isValidAtYear,
  parseSysPeriod,
} from '../src/components/shared/reportVersions.ts'

describe('parseSysPeriod', () => {
  it('parses a closed range with quoted timestamps', () => {
    const { lower, upper } = parseSysPeriod(
      '["2020-12-31 12:00:00+00","2021-12-31 12:00:00+00")',
    )
    expect(lower).toBe(Date.UTC(2020, 11, 31, 12))
    expect(upper).toBe(Date.UTC(2021, 11, 31, 12))
  })

  it('treats an open upper bound as null', () => {
    const { lower, upper } = parseSysPeriod('["2026-09-22 09:02:14.05421+00",)')
    expect(lower).toBe(Date.parse('2026-09-22T09:02:14.054Z'))
    expect(upper).toBeNull()
  })

  it('assumes UTC for timestamps without an offset', () => {
    const { lower } = parseSysPeriod('["2020-12-31 12:00:00",)')
    expect(lower).toBe(Date.UTC(2020, 11, 31, 12))
  })
})

const row = (id: string, from: number | null, to: number | null) => ({
  id,
  sys_period:
    from == null
      ? 'empty'
      : `[${new Date(from).toISOString().replace('Z', '+00')},${to == null ? '' : new Date(to).toISOString().replace('Z', '+00')})`,
})

describe('isValidAtYear', () => {
  it('is valid while the period contains the end of the year', () => {
    const v = row('a', Date.UTC(2020, 11, 31, 12), Date.UTC(2021, 11, 31, 12))
    expect(isValidAtYear(v as never, 2020)).toBe(true)
    // upper bound is exclusive: the next year already uses the next version
    expect(isValidAtYear(v as never, 2021)).toBe(false)
  })

  it('stays valid for all later years without an upper bound', () => {
    const v = row('a', Date.UTC(2014, 11, 31, 12), null)
    expect(isValidAtYear(v as never, 2015)).toBe(true)
    expect(isValidAtYear(v as never, 2025)).toBe(true)
  })
})

describe('asOfYear', () => {
  it('picks the last version historized before the end of the year', () => {
    const versions = [
      row('a', Date.UTC(2018, 11, 31, 12), Date.UTC(2020, 11, 31, 12)),
      row('a', Date.UTC(2020, 11, 31, 12), null),
      row('b', Date.UTC(2019, 11, 31, 12), Date.UTC(2021, 11, 31, 12)),
    ] as never[]
    const picked = asOfYear(versions, 2020, 'id')
    expect(picked.map((p) => (p as { id: string }).id).sort()).toEqual(['a', 'b'])
    // 2021: b has no later version and drops out
    expect(asOfYear(versions, 2021, 'id').map((p) => (p as { id: string }).id)).toEqual(['a'])
  })
})
