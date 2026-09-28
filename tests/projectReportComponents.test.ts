import { describe, expect, it } from 'vitest'

import {
  erfolgSortOf,
  hasQualifyingPopulation,
  popCountsAsOfYear,
  veränderung,
} from '../src/formsAndLists/projectReport/projectReportComponents.tsx'

type PlaceRow = {
  place_id: string
  parent_id: string | null
  level: number | null
  since: number | null
  status: string | null
  relevant: boolean
}

const pop = (
  id: string,
  status: string,
  since: number | null = 1990,
): PlaceRow => ({
  place_id: id,
  parent_id: null,
  level: 1,
  since,
  status,
  relevant: true,
})

const tpop = (
  id: string,
  parentId: string,
  status: string,
  options: { relevant?: boolean; since?: number } = {},
): PlaceRow => ({
  place_id: id,
  parent_id: parentId,
  level: 2,
  since: options.since ?? 1990,
  status,
  relevant: options.relevant ?? true,
})

describe('erfolgSortOf', () => {
  it('maps the apf2 ap_erfkrit_werte texts to their sort values', () => {
    expect(erfolgSortOf('sehr erfolgreich')).toBe(1)
    expect(erfolgSortOf('erfolgreich')).toBe(2)
    expect(erfolgSortOf('mässig erfolgreich')).toBe(3)
    expect(erfolgSortOf('wenig erfolgreich')).toBe(4)
    expect(erfolgSortOf('nicht erfolgreich')).toBe(5)
    expect(erfolgSortOf('unsichere Entwicklung')).toBe(6)
  })

  it('returns null for missing or unknown values', () => {
    expect(erfolgSortOf(null)).toBeNull()
    expect(erfolgSortOf(undefined)).toBeNull()
    expect(erfolgSortOf('')).toBeNull()
    expect(erfolgSortOf('gut')).toBeNull()
  })
})

describe('veränderung', () => {
  it('compares nothing while unsicher or a year is missing', () => {
    expect(veränderung(6, 2)).toBe('')
    expect(veränderung(2, 6)).toBe('')
    expect(veränderung(null, 2)).toBe('')
    expect(veränderung(2, null)).toBe('')
  })

  it('shows nothing when unchanged, ― when worse, ╋ when better', () => {
    // the sort value climbs as success declines (1=sehr … 5=nicht)
    expect(veränderung(3, 3)).toBe('')
    expect(veränderung(4, 3)).toBe('―')
    expect(veränderung(2, 3)).toBe('╋')
  })
})

describe('popCountsAsOfYear (apf2 jber_akt_pop)', () => {
  it('counts pop status 100/200 with at least one relevant, known tpop', () => {
    const rows = [
      pop('p1', 'ursprünglich, aktuell'),
      tpop('t1', 'p1', 'ursprünglich, aktuell'),
      pop('p2', 'angesiedelt, aktuell'),
      tpop('t2', 'p2', 'angesiedelt, aktuell'),
      // angesiedelt pop whose only tpop is NOT relevant -> does not count
      pop('p3', 'angesiedelt, aktuell'),
      tpop('t3', 'p3', 'angesiedelt, aktuell', { relevant: false }),
      // erloschen pop (101) never counts, even with tpop
      pop('p4', 'ursprünglich, erloschen'),
      tpop('t4', 'p4', 'ursprünglich, aktuell'),
    ]
    expect(popCountsAsOfYear(rows, 2025)).toEqual({
      pop100: 1,
      pop200: 1,
      total: 2,
    })
  })

  it('counts tpops regardless of their status (jber_akt_pop has no status filter)', () => {
    const rows = [
      pop('p1', 'angesiedelt, aktuell'),
      tpop('t1', 'p1', 'angesiedelt, erloschen/nicht etabliert'),
    ]
    expect(popCountsAsOfYear(rows, 2025)).toEqual({
      pop100: 0,
      pop200: 1,
      total: 1,
    })
  })

  it('respects bekannt_seit of both pop and tpop per year', () => {
    const rows = [
      pop('p1', 'ursprünglich, aktuell', 2010),
      tpop('t1', 'p1', 'ursprünglich, aktuell', { since: 2010 }),
      pop('p2', 'ursprünglich, aktuell', 2010),
      tpop('t2', 'p2', 'ursprünglich, aktuell', { since: 2030 }),
    ]
    expect(popCountsAsOfYear(rows, 2020)).toEqual({
      pop100: 1,
      pop200: 0,
      total: 1,
    })
  })
})

describe('hasQualifyingPopulation (apf2 jber_abc erfolg CTE)', () => {
  it('requires a non-potential pop with a non-potential, relevant, known tpop', () => {
    expect(
      hasQualifyingPopulation(
        [pop('p1', 'ursprünglich, aktuell'), tpop('t1', 'p1', 'ursprünglich, aktuell')],
        2025,
      ),
    ).toBe(true)
    // erloschen tpops (code 101) still qualify — jber_abc only excludes
    // potential (>= 300), unlike the kontrolliert chart series
    expect(
      hasQualifyingPopulation(
        [pop('p1', 'ursprünglich, aktuell'), tpop('t1', 'p1', 'ursprünglich, erloschen')],
        2025,
      ),
    ).toBe(true)
    // tpop irrelevant disqualifies
    expect(
      hasQualifyingPopulation(
        [pop('p1', 'ursprünglich, aktuell'), tpop('t1', 'p1', 'ursprünglich, aktuell', { relevant: false })],
        2025,
      ),
    ).toBe(false)
    // erloschen pops (code 202) also still qualify — same < 300 rule
    expect(
      hasQualifyingPopulation(
        [pop('p1', 'angesiedelt, erloschen'), tpop('t1', 'p1', 'angesiedelt, aktuell')],
        2025,
      ),
    ).toBe(true)
    // pop bekannt_seit after the year disqualifies
    expect(
      hasQualifyingPopulation(
        [pop('p1', 'ursprünglich, aktuell'), tpop('t1', 'p1', 'ursprünglich, aktuell', { since: 2030 })],
        2025,
      ),
    ).toBe(false)
    // tpop without pop row does not qualify
    expect(
      hasQualifyingPopulation([tpop('t1', 'px', 'ursprünglich, aktuell')], 2025),
    ).toBe(false)
  })
})
