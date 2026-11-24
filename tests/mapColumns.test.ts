import { describe, it, expect } from 'vitest'

import { mapColumnsByTable } from '../src/modules/mapColumns.ts'

// electric sends partial update messages carrying only the changed columns
// (goal_reports' label/updated_at bump when a trigger fires) — the mapping
// must pass those through and must NOT rebuild the row with undefined for
// missing columns: the sync client writes undefined as NULL, and
// goal_reports.created_at is NOT NULL (plus goal_id/data were wiped)
describe('mapColumnsByTable.goal_reports', () => {
  const map = mapColumnsByTable.goal_reports

  it('passes partial update messages through unchanged', () => {
    const change = {
      value: { goal_report_id: 'r1', label: 'r1', updated_at: 't2' },
    }
    expect(map(change)).toEqual({
      goal_report_id: 'r1',
      label: 'r1',
      updated_at: 't2',
    })
  })

  it('normalizes the data column on full rows, keeps everything else', () => {
    const change = {
      value: {
        goal_report_id: 'r1',
        goal_id: 'g1',
        label: 'r1',
        created_at: 't1',
        updated_at: 't1',
        updated_by: 'me',
        data: 'not-json',
        sys_period: '[,)',
      },
    }
    expect(map(change)).toEqual({
      goal_report_id: 'r1',
      goal_id: 'g1',
      label: 'r1',
      created_at: 't1',
      updated_at: 't1',
      updated_by: 'me',
      data: '"not-json"',
      sys_period: '[,)',
    })
  })

  it('maps empty/falsy data to an empty jsonb object', () => {
    expect(map({ value: { goal_report_id: 'r1', data: '' } })).toEqual({
      goal_report_id: 'r1',
      data: '{}',
    })
    expect(map({ value: { goal_report_id: 'r1', data: null } })).toEqual({
      goal_report_id: 'r1',
      data: '{}',
    })
  })

  it('does not throw on move-out messages (null value)', () => {
    expect(map({ value: null as unknown as Record<string, unknown> })).toEqual({})
  })
})
