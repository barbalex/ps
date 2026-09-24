import { describe, expect, it } from 'vitest'

import { qualifyingRowsOfYear } from '../src/formsAndLists/chart/Chart/buildData/index.ts'
import type { VersionedRow } from '../src/components/shared/reportVersions.ts'

const PERIOD = '["2020-12-31 12:00:00+00",)'

const pop = (id: string, status: string): VersionedRow => ({
  place_id: `pop-${id}`,
  parent_id: null,
  level: 1,
  since: 2000,
  data: { status },
  sys_period: PERIOD,
})

const tpop = (
  id: string,
  parentId: string,
  status: string,
  opts: Partial<VersionedRow> = {},
): VersionedRow => ({
  place_id: id,
  parent_id: `pop-${parentId}`,
  level: 2,
  since: 2010,
  data: { status },
  sys_period: PERIOD,
  ...opts,
})

describe('qualifyingRowsOfYear (apf2 tpop_kontrolliert rules)', () => {
  it('counts erloschen tpops only in the first year of that status', () => {
    const rows = [
      pop('a', 'ursprünglich, aktuell'),
      // same place with two versions: 2020 aktuell, 2021 erloschen
      tpop('tp-1', 'a', 'angesiedelt, aktuell', {
        sys_period: '["2020-12-31 12:00:00+00","2021-12-31 12:00:00+00")',
      }),
      tpop('tp-1', 'a', 'angesiedelt, erloschen/nicht etabliert', {
        sys_period: '["2021-12-31 12:00:00+00",)',
      }),
    ]
    expect(
      qualifyingRowsOfYear(rows, 2020, '2').map((r) => r.place_id),
    ).toEqual(['tp-1'])
    // 2021: the status is fresh -> counts
    expect(
      qualifyingRowsOfYear(rows, 2021, '2').map((r) => r.place_id),
    ).toEqual(['tp-1'])
    // 2022: unchanged from 2021 -> dropped (period still open, same status)
    expect(qualifyingRowsOfYear(rows, 2022, '2')).toEqual([])
  })

  it('excludes tpops under potential pops, irrelevant tpops and missing bekannt_seit', () => {
    const rows = [
      pop('pot', 'potentieller Wuchs-/Ansiedlungsort'),
      pop('ok', 'angesiedelt, aktuell'),
      tpop('tp-pot', 'pot', 'angesiedelt, aktuell'),
      tpop('tp-irrelevant', 'ok', 'angesiedelt, aktuell', {
        relevant_for_reports: false,
      }),
      tpop('tp-unknown-since', 'ok', 'angesiedelt, aktuell', { since: null }),
      tpop('tp-future', 'ok', 'angesiedelt, aktuell', { since: 2030 }),
      tpop('tp-ok', 'ok', 'angesiedelt, aktuell'),
    ]
    expect(
      qualifyingRowsOfYear(rows, 2025, '2').map((r) => r.place_id),
    ).toEqual(['tp-ok'])
  })

  it('counts pops by their own status', () => {
    const rows = [
      pop('p1', 'ursprünglich, aktuell'),
      pop('p2', 'potentieller Wuchs-/Ansiedlungsort'),
    ]
    expect(
      qualifyingRowsOfYear(rows, 2025, '1').map((r) => r.place_id),
    ).toEqual(['pop-p1'])
  })
})
