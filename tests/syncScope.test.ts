import { afterEach, describe, expect, it } from 'vitest'

import { createTestDb } from './helpers/createTestDb.ts'

/**
 * sync_scope() must mirror the shape where clauses: projects/subprojects by
 * project role, places by place role (roles inherited by triggers included).
 */

const claimsOf = (userId: string | null) =>
  userId ?
    `SET request.jwt.claims = '{"role":"app_user","user_id":"${userId}"}';`
  : `SET request.jwt.claims TO DEFAULT;`

type Scope = {
  project_ids: string[]
  subproject_ids: string[]
  place_ids: string[]
}

const setup = async () => {
  const { db, ids } = await createTestDb([
    '12_writePermissionTriggers.sql',
    '17_syncScope.sql',
  ])
  const scopeOf = async (userId: string): Promise<Scope> => {
    await db.exec(claimsOf(userId))
    const res = await db.query<{ scope: Scope }>(
      `SELECT sync_scope() AS scope`,
    )
    return res.rows[0]!.scope
  }
  return { db, ids, scopeOf }
}

describe('sync_scope', () => {
  let ctx: Awaited<ReturnType<typeof setup>> | null = null

  afterEach(async () => {
    await ctx?.db.close()
    ctx = null
  })

  it('returns the project of a project member', async () => {
    ctx = await setup()
    const { ids, scopeOf } = ctx
    const scope = await scopeOf(ids.writer)
    expect(scope.project_ids).toEqual([ids.project])
  })

  it('mirrors the role tables for every fixture user', async () => {
    ctx = await setup()
    const { db, ids, scopeOf } = ctx
    for (const userId of [ids.reader, ids.writer, ids.designer, ids.outsider, ids.stranger]) {
      const expected = await db.query<{
        project_ids: string[]
        subproject_ids: string[]
        place_ids: string[]
      }>(
        `WITH pu AS (
           SELECT project_user_id FROM project_users
           WHERE auth_user_id = $1
              OR email = (SELECT email FROM users WHERE user_id = $1)
         ),
         p AS (
           SELECT DISTINCT project_id FROM project_roles
           WHERE project_user_id IN (SELECT project_user_id FROM pu)
         ),
         s AS (
           SELECT DISTINCT subproject_id FROM subprojects
           WHERE project_id IN (SELECT project_id FROM p)
             AND subproject_id IN (SELECT subproject_id FROM subproject_roles WHERE project_user_id IN (SELECT project_user_id FROM pu))
         ),
         pl AS (
           SELECT DISTINCT place_id FROM places
           WHERE subproject_id IN (SELECT subproject_id FROM s)
             AND place_id IN (SELECT place_id FROM place_roles WHERE project_user_id IN (SELECT project_user_id FROM pu))
         )
         SELECT
           COALESCE((SELECT array_agg(project_id ORDER BY project_id) FROM p), '{}') AS project_ids,
           COALESCE((SELECT array_agg(subproject_id ORDER BY subproject_id) FROM s), '{}') AS subproject_ids,
           COALESCE((SELECT array_agg(place_id ORDER BY place_id) FROM pl), '{}') AS place_ids`,
        [userId],
      )
      const scope = await scopeOf(userId)
      expect([...scope.project_ids].sort(), userId).toEqual(expected.rows[0]!.project_ids)
      expect([...scope.subproject_ids].sort(), userId).toEqual(expected.rows[0]!.subproject_ids)
      expect([...scope.place_ids].sort(), userId).toEqual(expected.rows[0]!.place_ids)
    }
  })

  it('excludes subprojects and places without a project role (nested scope)', async () => {
    ctx = await setup()
    const { ids, scopeOf } = ctx
    // outsider only has a subproject role: the shapes require the project
    const outsider = await scopeOf(ids.outsider)
    expect(outsider).toEqual({ project_ids: [], subproject_ids: [], place_ids: [] })
    // stranger only has a place role
    const stranger = await scopeOf(ids.stranger)
    expect(stranger).toEqual({ project_ids: [], subproject_ids: [], place_ids: [] })
  })

  it('shrinks after a role is revoked', async () => {
    ctx = await setup()
    const { db, ids, scopeOf } = ctx
    // the fixture seeds in sync mode (no role cascade): add the subproject
    // and place rows a project writer would normally have inherited
    await db.exec(`SET electric.syncing TO 'true';`)
    await db.exec(`
      INSERT INTO subproject_roles (subproject_id, project_user_id, role)
      SELECT '${ids.subproject}', project_user_id, 'write-all'
      FROM project_users WHERE email = 'writer@example.com';
      INSERT INTO place_roles (place_id, project_user_id, role)
      SELECT '${ids.place}', project_user_id, 'write-all'
      FROM project_users WHERE email = 'writer@example.com';
    `)
    const before = await scopeOf(ids.writer)
    expect(before.subproject_ids).toEqual([ids.subproject])
    expect(before.place_ids).toEqual([ids.place])
    await db.exec(`
      DELETE FROM project_roles
      WHERE project_user_id IN (
        SELECT project_user_id FROM project_users WHERE email = 'writer@example.com'
      );
    `)
    await db.exec(`SET electric.syncing TO DEFAULT;`)
    const scope = await scopeOf(ids.writer)
    // the nested sets collapse with the project, whatever lower rows remain
    expect(scope).toEqual({ project_ids: [], subproject_ids: [], place_ids: [] })
  })

  it('rejects unauthenticated calls', async () => {
    ctx = await setup()
    const { db } = ctx
    await db.exec(claimsOf(null))
    await expect(db.query(`SELECT sync_scope()`)).rejects.toThrow(
      /authenticated/,
    )
  })
})
