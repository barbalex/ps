import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { readFileSync } from 'node:fs'

import { createTestDb, type TestFixture } from './helpers/createTestDb.ts'

/**
 * Client-only sync trigger: a sync apply inserting a row whose unique key
 * is held by a stale local row (different primary key) replaces that row
 * instead of aborting on the unique constraint.
 */

let ctx: TestFixture

beforeAll(async () => {
  ctx = await createTestDb()
  await ctx.db.exec(
    readFileSync(
      new URL('../src/sql/syncReplaceStaleUniqueRows.sql', import.meta.url),
      'utf8',
    ),
  )
}, 120_000)

afterAll(async () => {
  await ctx?.db.close()
})

describe('sync_replace_stale_unique_rows_trigger', () => {
  it('replaces a stale project_users row with the same (project_id, email)', async () => {
    const { db, ids } = ctx
    const stale = await db.query<{ project_user_id: string }>(
      `SELECT project_user_id FROM project_users WHERE project_id = $1 AND email = 'writer@example.com'`,
      [ids.project],
    )
    const staleId = stale.rows[0]!.project_user_id
    const newId = '00000000-0000-7000-8000-00000000aaaa'

    await db.exec(`SET electric.syncing TO 'true';`)
    await db.query(
      `INSERT INTO project_users (project_user_id, project_id, email) VALUES ($1, $2, 'writer@example.com')`,
      [newId, ids.project],
    )
    await db.exec(`SET electric.syncing TO DEFAULT;`)

    const rows = await db.query<{ project_user_id: string }>(
      `SELECT project_user_id FROM project_users WHERE project_id = $1 AND email = 'writer@example.com'`,
      [ids.project],
    )
    expect(rows.rows.map((r) => r.project_user_id)).toEqual([newId])
    // the stale row's roles went with it (cascade)
    const roles = await db.query<{ n: number }>(
      `SELECT count(*)::int n FROM project_roles WHERE project_user_id = $1`,
      [staleId],
    )
    expect(roles.rows[0]?.n).toBe(0)
  })

  it('leaves user writes alone: the unique constraint still fires', async () => {
    const { db, ids } = ctx
    await expect(
      db.query(
        `INSERT INTO project_users (project_user_id, project_id, email) VALUES ($1, $2, 'reader@example.com')`,
        ['00000000-0000-7000-8000-00000000bbbb', ids.project],
      ),
    ).rejects.toThrow(/project_users_project_id_email_unique/)
  })
})
