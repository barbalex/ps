import { describe, expect, it, beforeEach, afterEach } from 'vitest'

import { createTestDb } from './helpers/createTestDb.ts'

/**
 * Tests the server-side apply_operations function (the batched write path)
 * against the real schema plus the write-permission triggers. JWT identity
 * is provided via the request.jwt.claims GUC, like PostgREST does.
 */

const WRITER = '00000000-0000-7000-8000-000000000002' // writer role in the fixture
const OUTSIDER = '00000000-0000-7000-8000-000000000004' // no role anywhere
const PLACE = '30000000-0000-7000-8000-000000000001'

type Result = { op_index: number; status: string; detail: string | null }

const claimsOf = (userId: string | null) =>
  userId ?
    `SET request.jwt.claims = '{"role":"app_user","user_id":"${userId}"}';`
  : `SET request.jwt.claims TO DEFAULT;`

const setup = async () => {
  const { db, ids } = await createTestDb([
    '12_writePermissionTriggers.sql',
    '14_applyOperations.sql',
  ])
  return { db, ids }
}

const apply = async (db: Awaited<ReturnType<typeof setup>>['db'], ops: object[]) =>
  (
    await db.query<Result>(
      `SELECT * FROM apply_operations($1::jsonb)`,
      [JSON.stringify(ops)],
    )
  ).rows

describe('apply_operations', () => {
  let ctx: Awaited<ReturnType<typeof setup>>

  beforeEach(async () => {
    ctx = await setup()
    await ctx.db.exec(claimsOf(WRITER))
  })

  afterEach(async () => {
    await ctx.db.close()
  })

  it('applies a batch in order: insert, then update, then delete', async () => {
    const { db } = ctx
    const id = '70000000-0000-7000-8000-000000000001'
    const results = await apply(db, [
      { table: 'places', operation: 'insert', rowIdName: 'place_id', rowId: id,
        draft: { parent_id: PLACE, subproject_id: ctx.ids.subproject, level: 2, name: 'batch test' },
        time: '2026-09-28T10:00:00Z' },
      { table: 'places', operation: 'update', rowIdName: 'place_id', rowId: id,
        draft: { name: 'batch test renamed' }, time: '2026-09-28T10:01:00Z' },
    ])
    expect(results.map((r) => r.status)).toEqual(['applied', 'applied'])
    const row = await db.query<{ name: string }>(
      `SELECT name FROM places WHERE place_id = $1`, [id],
    )
    expect(row.rows[0]?.name).toBe('batch test renamed')

    const deleted = await apply(db, [
      { table: 'places', operation: 'delete', rowIdName: 'place_id', rowId: id,
        time: '2026-09-28T10:02:00Z' },
    ])
    expect(deleted[0]?.status).toBe('applied')
    const count = await db.query<{ count: string }>(
      `SELECT count(*)::text AS count FROM places WHERE place_id = $1`, [id],
    )
    expect(count.rows[0]?.count).toBe('0')
  })

  it('reports duplicates and no-row instead of failing the batch', async () => {
    const { db } = ctx
    const id = '70000000-0000-7000-8000-000000000002'
    const results = await apply(db, [
      { table: 'places', operation: 'insert', rowIdName: 'place_id', rowId: id,
        draft: { parent_id: PLACE, subproject_id: ctx.ids.subproject, level: 2, name: 'once' },
        time: '2026-09-28T10:00:00Z' },
      { table: 'places', operation: 'insert', rowIdName: 'place_id', rowId: id,
        draft: { parent_id: PLACE, subproject_id: ctx.ids.subproject, level: 2, name: 'twice' },
        time: '2026-09-28T10:00:00Z' },
      { table: 'places', operation: 'update', rowIdName: 'place_id',
        rowId: '99999999-9999-9999-9999-999999999999',
        draft: { name: 'nothing' }, time: '2026-09-28T10:00:00Z' },
    ])
    expect(results.map((r) => r.status)).toEqual(['applied', 'duplicate', 'no-row'])
  })

  it('isolates permission failures: later operations still apply', async () => {
    const { db } = ctx
    // outsider has no write role anywhere -> the enforce triggers deny
    await db.exec(claimsOf(OUTSIDER))
    const id = '70000000-0000-7000-8000-000000000003'
    const results = await apply(db, [
      { table: 'places', operation: 'insert', rowIdName: 'place_id', rowId: id,
        draft: { parent_id: PLACE, subproject_id: ctx.ids.subproject, level: 2, name: 'denied' },
        time: '2026-09-28T10:00:00Z' },
      { table: 'messages', operation: 'insert', rowIdName: 'message_id', rowId: id,
        draft: { message: 'allowed' }, time: '2026-09-28T10:00:00Z' },
    ])
    expect(results[0]?.status).toBe('permission')
    expect(results[0]?.detail).toContain('write')
    expect(results[1]?.status).toBe('applied')
    // the denied insert was rolled back alone
    const count = await db.query<{ count: string }>(
      `SELECT count(*)::text AS count FROM places WHERE place_id = $1`, [id],
    )
    expect(count.rows[0]?.count).toBe('0')
  })

  it('rejects unknown tables and unknown filter columns', async () => {
    const { db } = ctx
    const results = await apply(db, [
      { table: 'pg_class', operation: 'update', rowIdName: 'oid', rowId: '1',
        draft: { relname: 'x' }, time: '2026-09-28T10:00:00Z' },
      { table: 'places', operation: 'delete',
        filter: { function: 'eq', column: 'not_a_column; DROP TABLE places', value: '1' },
        time: '2026-09-28T10:00:00Z' },
    ])
    expect(results[0]?.status).toBe('rejected')
    expect(results[1]?.status).toBe('error')
    expect(results[1]?.detail).toContain('42703')
    // the injection attempt did not drop anything
    const alive = await db.query<{ count: string }>(
      `SELECT count(*)::text AS count FROM places`,
    )
    expect(Number(alive.rows[0]?.count)).toBeGreaterThan(0)
  })

  it('supports filters and stamps audit columns', async () => {
    const { db } = ctx
    const time = '2026-09-28T10:00:00Z'
    await apply(db, [
      { table: 'actions', operation: 'update',
        filters: [
          { function: 'eq', column: 'place_id', value: PLACE },
          { function: 'neq', column: 'action_id', value: '99999999-9999-9999-9999-999999999999' },
        ],
        draft: { relevant_for_reports: false }, time },
    ])
    const row = await db.query<{ updated_by: string | null }>(
      `SELECT updated_by FROM actions WHERE place_id = $1 LIMIT 1`, [PLACE],
    )
    // updated_by comes from the JWT user's email (the fixture writer)
    expect(row.rows[0]?.updated_by).toBe('writer@example.com')
  })

  it('requires an authenticated user', async () => {
    const { db } = ctx
    await db.exec(claimsOf(null))
    await expect(() =>
      apply(db, [
        { table: 'messages', operation: 'insert', rowIdName: 'message_id',
          rowId: '70000000-0000-7000-8000-000000000004',
          draft: { message: 'anon' }, time: '2026-09-28T10:00:00Z' },
      ]),
    ).rejects.toThrow(/no authenticated user/)
  })
})
