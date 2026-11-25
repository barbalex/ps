import { describe, it, expect, beforeAll, afterAll } from 'vitest'

import { createTestDb, type TestFixture } from './helpers/createTestDb.ts'

/**
 * Goal reports gained the report year (2026-11): the goal report form was
 * empty — the table had no year column (unlike every other report table)
 * and projects usually define no fields for it.
 * - new goal reports default year to the current year
 * - labels fall back to the year instead of the raw uuid
 * - updating the year relabels
 * - goal_reports_label_by still wins when configured
 */

let fixture: TestFixture

beforeAll(async () => {
  fixture = await createTestDb()
})

afterAll(async () => {
  await fixture?.db.close()
})

const GOAL = '21000000-0000-7000-8000-000000000001'
const GOAL_REPORT = '22000000-0000-7000-8000-000000000001'

describe('goal report year and labels', () => {
  beforeAll(async () => {
    const { db, ids } = fixture

    await db.exec(`
      INSERT INTO goals(goal_id, subproject_id, year, name) VALUES
        ('${GOAL}', '${ids.subproject}', 2024, 'Ziel');
      INSERT INTO goal_reports(goal_report_id, goal_id) VALUES
        ('${GOAL_REPORT}', '${GOAL}');
    `)
  })

  it('defaults the year of new goal reports to the current year', async () => {
    const res = await fixture.db.query(
      `SELECT year FROM goal_reports WHERE goal_report_id = $1`,
      [GOAL_REPORT],
    )
    expect(res.rows[0].year).toBe(new Date().getFullYear())
  })

  it('labels goal reports with the year instead of the uuid', async () => {
    const res = await fixture.db.query(
      `SELECT label FROM goal_reports WHERE goal_report_id = $1`,
      [GOAL_REPORT],
    )
    expect(res.rows[0].label).toBe(String(new Date().getFullYear()))
  })

  it('relabels when the year changes', async () => {
    await fixture.db.query(
      `UPDATE goal_reports SET year = 2030 WHERE goal_report_id = $1`,
      [GOAL_REPORT],
    )
    const res = await fixture.db.query(
      `SELECT label FROM goal_reports WHERE goal_report_id = $1`,
      [GOAL_REPORT],
    )
    expect(res.rows[0].label).toBe('2030')
  })

  it('prefers the configured goal_reports_label_by data field', async () => {
    const { db, ids } = fixture

    await db.exec(`
      UPDATE projects SET goal_reports_label_by = 'erfolg'
      WHERE project_id = '${ids.project}';
      UPDATE goal_reports SET data = '{"erfolg": "gut"}'::jsonb
      WHERE goal_report_id = '${GOAL_REPORT}';
    `)
    const res = await db.query(
      `SELECT label FROM goal_reports WHERE goal_report_id = $1`,
      [GOAL_REPORT],
    )
    expect(res.rows[0].label).toBe('gut')
  })
})
