import { afterAll, afterEach, beforeAll, beforeEach, expect, it } from 'vitest'
import { createTestDb, type TestFixture } from './helpers/createTestDb.ts'

let fixture: TestFixture
const square = 'SRID=4326;MULTIPOLYGON(((0 0,10 0,10 10,0 10,0 0)))'

beforeAll(async () => {
  fixture = await createTestDb([
    '09_seedQcs.sql',
    '12_writePermissionTriggers.sql',
    '14_applyOperations.sql',
  ])
})
beforeEach(async () => {
  await fixture.db.exec('BEGIN')
})
afterEach(async () => {
  await fixture.db.exec('ROLLBACK')
})
afterAll(async () => {
  await fixture.db.close()
})

it('uses full coverage, including edges, and excludes missing/empty operands in either active mode', async () => {
  const { rows } = await fixture.db.query(
    `
    SELECT name, project_area_matches(g::geometry, a::geometry, 'inside') AS inside,
                 project_area_matches(g::geometry, a::geometry, 'outside') AS outside
    FROM (VALUES
      ('edge', 'SRID=4326;POINT(0 5)', $1),
      ('mixed', 'SRID=4326;GEOMETRYCOLLECTION(POINT(1 1),POINT(11 1))', $1),
      ('empty feature', 'SRID=4326;GEOMETRYCOLLECTION EMPTY', $1),
      ('missing feature', NULL, $1),
      ('empty area', 'SRID=4326;POINT(5 5)', 'SRID=4326;MULTIPOLYGON EMPTY'),
      ('missing area', 'SRID=4326;POINT(5 5)', NULL)
    ) AS cases(name, g, a)
  `,
    [square],
  )
  expect(rows).toEqual([
    { name: 'edge', inside: true, outside: false },
    { name: 'mixed', inside: false, outside: true },
    { name: 'empty feature', inside: false, outside: false },
    { name: 'missing feature', inside: false, outside: false },
    { name: 'empty area', inside: false, outside: false },
    { name: 'missing area', inside: false, outside: false },
  ])
})

it('enforces area changes and clearing in the write RPC without restricting unrelated writer edits', async () => {
  const { db, ids } = fixture
  const apply = async (
    user: string,
    draft: Record<string, unknown>,
    projectId = ids.project,
  ) => {
    await db.query(`SELECT set_config('request.jwt.claims', $1, true)`, [
      JSON.stringify({ role: 'app_user', user_id: user }),
    ])
    const result = await db.query<{ status: string }>(
      'SELECT status FROM apply_operations($1::jsonb)',
      [
        JSON.stringify([
          {
            table: 'projects',
            operation: 'update',
            rowIdName: 'project_id',
            rowId: projectId,
            draft,
            time: '2026-11-27T10:00:00Z',
          },
        ]),
      ],
    )
    return result.rows[0].status
  }
  expect(await apply(ids.reader, { geometry: square })).toBe('permission')
  expect(await apply(ids.writer, { geometry: square })).toBe('permission')
  expect(await apply(ids.designer, { geometry: square })).toBe('applied')
  // Same bounding box but different area, and a field-clear attempt.
  expect(
    await apply(ids.writer, {
      geometry: 'SRID=4326;MULTIPOLYGON(((0 0,10 0,10 10,0 0)))',
    }),
  ).toBe('permission')
  expect(await apply(ids.writer, { geometry: null })).toBe('permission')
  expect(await apply(ids.writer, { name: 'Renamed' })).toBe('applied')
  expect(await apply(ids.designer, { geometry: null })).toBe('applied')

  await db.query(`SELECT set_config('request.jwt.claims', $1, true)`, [
    JSON.stringify({ role: 'app_user', user_id: ids.writer }),
  ])
  const owned = await db.query<{ project_id: string }>(
    'INSERT INTO projects(account_id, geometry) VALUES ($1, $2) RETURNING project_id',
    [ids.account, square],
  )
  expect(
    await apply(ids.writer, { geometry: null }, owned.rows[0].project_id),
  ).toBe('applied')
})

it('runs each seeded QC against the record’s own geometry and project and links to nested records', async () => {
  const { db, ids } = fixture
  const otherProject = '10000000-0000-7000-8000-000000000011'
  const checkId = '90000000-0000-7000-8000-000000000011'
  await db.exec(`
    SET LOCAL electric.syncing = 'true';
    UPDATE projects SET geometry = '${square}' WHERE project_id = '${ids.project}';
    INSERT INTO projects(project_id, geometry) VALUES ('${otherProject}', '${square}');
    UPDATE places SET parent_id = '${ids.place}', subproject_id = NULL, level = 2,
      geometry = 'SRID=4326;GEOMETRYCOLLECTION(LINESTRING(1 1,11 1))'
      WHERE place_id = '${ids.otherPlace}';
    UPDATE places SET geometry = 'SRID=4326;GEOMETRYCOLLECTION(POINT(0 5))'
      WHERE place_id = '${ids.place}';
    UPDATE actions SET geometry = 'SRID=4326;GEOMETRYCOLLECTION(POINT(20 20))'
      WHERE action_id = '${ids.action}';
    INSERT INTO checks(check_id, place_id, geometry)
      VALUES ('${checkId}', '${ids.otherPlace}', 'SRID=4326;GEOMETRYCOLLECTION(POINT(12 5))');
    INSERT INTO actions(place_id, geometry) VALUES
      ('${ids.otherPlace}', 'SRID=4326;GEOMETRYCOLLECTION(POINT(5 5))');
    INSERT INTO checks(place_id, geometry) VALUES ('${ids.otherPlace}', NULL);
  `)
  const root = `/data/projects/${ids.project}/subprojects/${ids.subproject}/places/${ids.place}`
  const nested = `${root}/places/${ids.otherPlace}`
  const expected = new Set([
    `${nested}/place`,
    `${root}/actions/${ids.action}/action`,
    `${nested}/checks/${checkId}/check`,
  ])
  const qcs = await db.query<{ sql: string }>(
    `SELECT sql FROM qcs WHERE level = 'project' AND sql LIKE '%project_area_matches(%'`,
  )
  const urls = new Set<string>()
  for (const { sql } of qcs.rows) {
    expect((await db.query(sql, [otherProject])).rows).toEqual([])
    const { rows } = await db.query<{ url: string }>(sql, [ids.project])
    expect(rows).toHaveLength(1)
    urls.add(rows[0].url)
  }
  expect(urls).toEqual(expected)
})
