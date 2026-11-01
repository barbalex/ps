import { describe, it, expect, beforeAll, afterAll } from 'vitest'

import { createTestDb, type TestFixture } from './helpers/createTestDb.ts'
import {
  buildProjectDump,
  DUMP_FORMAT_LINE,
} from '../src/modules/projectDump/exportProjectDump.ts'
import {
  parseProjectDump,
  ProjectDumpError,
} from '../src/modules/projectDump/parseProjectDump.ts'

let source: TestFixture
let target: TestFixture

beforeAll(async () => {
  source = await createTestDb()
  target = await createTestDb()
  // some data the simple fixture lacks: a geometry, jsonb data, a check
  await source.db.exec(`
    UPDATE places SET
      geometry = ST_GeomFromGeoJSON('{"type":"GeometryCollection","geometries":[{"type":"Point","coordinates":[8.5,47.4]}]}'),
      data = '{"nr": 3, "name": "O''Brien''s \\"meadow\\""}'::jsonb
    WHERE place_id = '${source.ids.place}';
    INSERT INTO checks (check_id, place_id, date, data) VALUES
      ('70000000-0000-7000-8000-000000000001', '${source.ids.place}', '2024-06-01', '{"typ":"Kontrolle"}');
  `)
}, 120_000)

afterAll(async () => {
  await source?.db.close()
  await target?.db.close()
})

describe('project dump export', () => {
  it('writes one parseable INSERT per table chunk, generated columns left out', async () => {
    const { parts, rowCount, tableCount, projectName } = await buildProjectDump(
      source.db,
      source.ids.project,
    )
    const text = parts.join('')
    expect(text.startsWith(DUMP_FORMAT_LINE)).toBe(true)
    expect(projectName).toBe('Test Project')
    expect(tableCount).toBeGreaterThanOrEqual(7) // projects, users, roles, subprojects, places, actions, checks, …
    expect(rowCount).toBeGreaterThanOrEqual(10)

    const dump = parseProjectDump(text)
    expect(dump.projectId).toBe(source.ids.project)
    const tables = dump.statements.map((s) => s.table)
    expect(tables.indexOf('subprojects')).toBeLessThan(tables.indexOf('places'))
    expect(tables.indexOf('places')).toBeLessThan(tables.indexOf('checks'))

    const places = dump.statements.find((s) => s.table === 'places')!
    const place = places.rows.find((r) => r.place_id === source.ids.place)!
    expect(typeof place.geometry).toBe('string') // hex EWKB, not GeoJSON
    expect((place.data as { name: string }).name).toBe('O\'Brien\'s "meadow"')
    // label is a generated column on places in this schema version
    const generated = await source.db.query<{ column_name: string }>(
      `SELECT column_name FROM information_schema.columns
       WHERE table_name = 'places' AND is_generated <> 'NEVER'`,
    )
    for (const { column_name } of generated.rows) {
      expect(places.columns).not.toContain(column_name)
    }
  })

  it('restores verbatim through psql-style execution (the SQL path)', async () => {
    const { parts } = await buildProjectDump(source.db, source.ids.project)
    // the same users exist in the target (global catalog); the project does not
    await target.db.exec(
      `DELETE FROM projects WHERE project_id = '${source.ids.project}'`,
    )
    await target.db.transaction(async (tx) => {
      await tx.exec(`SET LOCAL electric.syncing = 'true';`)
      await tx.exec(parts.join(''))
    })
    const counts = await target.db.query<{ t: string; n: number }>(`
      SELECT 'places' t, count(*)::int n FROM places WHERE subproject_id = '${source.ids.subproject}'
      UNION ALL SELECT 'checks', count(*)::int FROM checks WHERE place_id = '${source.ids.place}'
      UNION ALL SELECT 'roles', count(*)::int FROM project_roles WHERE project_id = '${source.ids.project}'
    `)
    const byTable = Object.fromEntries(counts.rows.map((r) => [r.t, r.n]))
    expect(byTable.places).toBe(2)
    expect(byTable.checks).toBe(1)
    expect(byTable.roles).toBe(3)
    const geom = await target.db.query<{ srid: number; x: number }>(
      `SELECT ST_SRID(geometry) srid, ST_X(ST_GeometryN(geometry, 1)) x FROM places WHERE place_id = '${source.ids.place}'`,
    )
    expect(geom.rows[0]).toEqual({ srid: 4326, x: 8.5 })
  })

  it('rejects files that are not a dump of this app', () => {
    expect(() => parseProjectDump('DROP TABLE places;')).toThrow(ProjectDumpError)
    expect(() => parseProjectDump('-- only comments\n')).toThrow(/exactly one project/)
  })
})
