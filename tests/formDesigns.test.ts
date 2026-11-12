import { describe, it, expect, beforeAll, afterAll } from 'vitest'

import { createTestDb, type TestFixture } from './helpers/createTestDb.ts'

/**
 * Tests the form_designs schema side: one design per form target (the
 * plain form of a table or a table view), inactive by default.
 */

let fixture: TestFixture

beforeAll(async () => {
  fixture = await createTestDb()
})

afterAll(async () => {
  await fixture?.db.close()
})

const PROJECT = '80000000-0000-7000-8000-000000000001'
const VIEW_1 = '81000000-0000-7000-8000-000000000001'
const VIEW_2 = '81000000-0000-7000-8000-000000000002'

describe('form_designs', () => {
  beforeAll(async () => {
    const { db } = fixture
    await db.exec(`
      INSERT INTO projects(project_id, account_id, name) VALUES
        ('${PROJECT}', '${fixture.ids.account}', 'Form-Design-Projekt');
      INSERT INTO table_views(table_view_id, project_id, table_name, name_plural_de) VALUES
        ('${VIEW_1}', '${PROJECT}', 'checks', 'Kontrollen'),
        ('${VIEW_2}', '${PROJECT}', 'checks', 'Biotop-Kontrollen');
    `)
  })

  it('creates designs inactive by default', async () => {
    const { db } = fixture
    await db.query(
      `INSERT INTO form_designs(form_design_id, project_id, table_name) VALUES ('82000000-0000-7000-8000-000000000001', $1, 'checks')`,
      [PROJECT],
    )
    const res = await db.query<{ active: boolean }>(
      `SELECT active FROM form_designs WHERE form_design_id = '82000000-0000-7000-8000-000000000001'`,
    )
    expect(res.rows[0]?.active).toBe(false)
  })

  it('allows only one design per plain form target', async () => {
    const { db } = fixture
    await expect(
      db.query(
        `INSERT INTO form_designs(form_design_id, project_id, table_name) VALUES ('82000000-0000-7000-8000-000000000002', $1, 'checks')`,
        [PROJECT],
      ),
    ).rejects.toThrow(/form_designs_one_per_target_idx/)
  })

  it('separates the plain form from view targets and views from each other', async () => {
    const { db } = fixture
    // a design for a view coexists with the plain form's design…
    await db.query(
      `INSERT INTO form_designs(form_design_id, project_id, table_name, table_view_id) VALUES ('82000000-0000-7000-8000-000000000003', $1, 'checks', $2)`,
      [PROJECT, VIEW_1],
    )
    // …and from designs for other views
    await db.query(
      `INSERT INTO form_designs(form_design_id, project_id, table_name, table_view_id) VALUES ('82000000-0000-7000-8000-000000000004', $1, 'checks', $2)`,
      [PROJECT, VIEW_2],
    )
    // but not twice for the same view
    await expect(
      db.query(
        `INSERT INTO form_designs(form_design_id, project_id, table_name, table_view_id) VALUES ('82000000-0000-7000-8000-000000000005', $1, 'checks', $2)`,
        [PROJECT, VIEW_1],
      ),
    ).rejects.toThrow(/form_designs_one_per_target_idx/)

    // the resolver query of the runtime picks the design of its target
    const plain = await db.query<{ form_design_id: string }>(
      `SELECT form_design_id FROM form_designs WHERE project_id = $1 AND table_name = 'checks' AND table_view_id IS NULL LIMIT 1`,
      [PROJECT],
    )
    expect(plain.rows[0]?.form_design_id).toBe(
      '82000000-0000-7000-8000-000000000001',
    )
    const view = await db.query<{ form_design_id: string }>(
      `SELECT form_design_id FROM form_designs WHERE project_id = $1 AND table_name = 'checks' AND table_view_id = $2 LIMIT 1`,
      [PROJECT, VIEW_1],
    )
    expect(view.rows[0]?.form_design_id).toBe(
      '82000000-0000-7000-8000-000000000003',
    )
  })

  it('separates targets per table', async () => {
    const { db } = fixture
    await db.query(
      `INSERT INTO form_designs(form_design_id, project_id, table_name) VALUES ('82000000-0000-7000-8000-000000000006', $1, 'actions')`,
      [PROJECT],
    )
    const res = await db.query<{ count: number }>(
      `SELECT count(*) AS count FROM form_designs WHERE project_id = $1`,
      [PROJECT],
    )
    expect(Number(res.rows[0]?.count)).toBe(4)
  })
})
