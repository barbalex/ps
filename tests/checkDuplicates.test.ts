import { describe, it, expect } from 'vitest'

import { checkDuplicates } from '../src/formsAndLists/observationImport/checkDuplicates.ts'

type QueryCall = { sql: string; params: unknown[] }

/**
 * Fake db capturing queries. `counts` is returned row-by-row:
 * the n-th query gets counts[n] (default 0).
 */
const fakeDb = (counts: number[] = [], failOn?: number) => {
  const calls: QueryCall[] = []
  let index = 0
  const db = {
    query: async (sql: string, params: unknown[]) => {
      calls.push({ sql, params })
      const i = index++
      if (failOn === i) throw new Error('boom')
      return { rows: [{ count: String(counts[i] ?? 0) }] }
    },
  }
  return { db, calls }
}

describe('checkDuplicates', () => {
  it('returns 0 without querying when there are no rows', async () => {
    const { db, calls } = fakeDb()
    expect(await checkDuplicates(db, [])).toBe(0)
    expect(calls).toHaveLength(0)
  })

  it('counts a row as duplicate when the db finds a match', async () => {
    const { db, calls } = fakeDb([1])
    const result = await checkDuplicates(db, [{ a: 'x' }])
    expect(result).toBe(1)
    expect(calls).toHaveLength(1)
    expect(calls[0]?.sql).toContain("data->>'a'")
    expect(calls[0]?.params).toEqual(['x'])
  })

  it('excludes object-valued fields (like geometry) from the comparison', async () => {
    const { db, calls } = fakeDb([0])
    await checkDuplicates(db, [{ a: 'x', geometry: { type: 'Point' } }])
    expect(calls[0]?.sql).not.toContain('geometry')
    expect(calls[0]?.params).toEqual(['x'])
  })

  it('stringifies non-string values for the comparison', async () => {
    const { db, calls } = fakeDb([0])
    await checkDuplicates(db, [{ count: 5, when: null }])
    expect(calls[0]?.params).toEqual(['5', null])
  })

  it('skips a row whose query fails and keeps checking the rest', async () => {
    const { db } = fakeDb([1, 1], 0)
    // first query throws, second matches
    const result = await checkDuplicates(db, [{ a: 'x' }, { a: 'y' }])
    expect(result).toBe(1)
  })

  it('samples at most 100 rows for larger imports', async () => {
    const { db, calls } = fakeDb()
    const rows = Array.from({ length: 250 }, (_, i) => ({ a: i }))
    await checkDuplicates(db, rows)
    expect(calls.length).toBeLessThanOrEqual(100)
    // step = floor(250/100) = 2, so the second row checked is index 2
    // (values are stringified before being passed as params)
    expect(calls[1]?.params).toEqual(['2'])
  })
})
