import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { createTestDb, type TestFixture } from './helpers/createTestDb.ts'
import {
  mapCreationTarget,
  parentQuery,
  type CreationParent,
} from '../src/modules/mapCreationParents.ts'

describe('own-layer creation parents', () => {
  let fixture: TestFixture
  const child = '30000000-0000-7000-8000-000000000003'
  const otherSubproject = '20000000-0000-7000-8000-000000000002'
  beforeAll(async () => {
    fixture = await createTestDb()
    const { db, ids } = fixture
    await db.exec(`
      UPDATE projects SET places_label_by = 'name' WHERE project_id = '${ids.project}';
      UPDATE places SET name = 'Spring' WHERE subproject_id = '${ids.subproject}';
      INSERT INTO places (place_id, subproject_id, parent_id, level, name)
        VALUES ('${child}', '${ids.subproject}', '${ids.place}', 2, 'Source');
      INSERT INTO subprojects (subproject_id, project_id, name) VALUES
        ('${otherSubproject}', '${ids.project}', 'Another subproject');
      INSERT INTO places (subproject_id, level) VALUES ('${otherSubproject}', 1);
      UPDATE place_roles SET role = 'write-all'
        WHERE place_id = '${ids.otherPlace}' AND project_user_id IN
          (SELECT project_user_id FROM project_users WHERE email = 'stranger@example.com');
    `)
  })
  afterAll(() => fixture?.db.close())

  const options = async (
    table: 'place' | 'check' | 'action',
    level: number,
    userId: string,
    route: Parameters<typeof parentQuery>[1],
    picker = true,
    projectId = fixture.ids.project,
  ) => {
    const { sql, params } = parentQuery(
      { table, level },
      route,
      projectId,
      userId,
      picker,
    )
    return (await fixture.db.query<CreationParent>(sql, params)).rows
  }

  it('only enables creation for own places, checks and actions of level 1 or 2', () => {
    const layer = {
      layer_type: 'vector',
      type: 'own',
      own_table: 'checks',
      own_table_level: 2,
    }
    expect(mapCreationTarget(layer)).toEqual({ table: 'check', level: 2 })
    for (const change of [
      { type: 'wfs' },
      { layer_type: 'wms' },
      { own_table_level: null },
      { own_table_level: 3 },
      { own_table: 'observations_assigned' },
    ]) {
      expect(mapCreationTarget({ ...layer, ...change })).toBeNull()
    }
  })

  it('prefers the correct writable route ancestor for each layer', async () => {
    const { ids } = fixture
    const route = {
      subprojectId: ids.subproject,
      placeId: ids.place,
      placeId2: child,
    }
    for (const [table, level, placeId] of [
      ['place', 1, null],
      ['place', 2, ids.place],
      ['check', 1, ids.place],
      ['action', 2, child],
    ] as const) {
      expect(
        await options(table, level, ids.writer, route, false),
      ).toMatchObject([{ place_id: placeId, subproject_id: ids.subproject }])
    }
  })

  it('respects project, subproject and level scope, disambiguating identical paths by ID', async () => {
    const { ids } = fixture
    const rows = await options('action', 1, ids.writer, {
      subprojectId: ids.subproject,
    })
    expect(rows.map((r) => r.place_id).sort()).toEqual([
      ids.place,
      ids.otherPlace,
    ])
    expect(
      rows.every((r) => r.label.includes('Spring') && r.label.includes(r.id)),
    ).toBe(true)
    expect(
      await options('check', 2, ids.writer, { placeId: ids.otherPlace }),
    ).toEqual([])
    expect(
      await options('place', 1, ids.writer, {}, true, ids.stranger),
    ).toEqual([])
  })

  it('accepts a place-level writer only for checks/actions on that place; denies readers', async () => {
    const { ids } = fixture
    for (const table of ['action', 'check'] as const) {
      expect(
        (await options(table, 1, ids.stranger, {})).map((r) => r.id),
      ).toEqual([ids.otherPlace])
      expect(await options(table, 1, ids.reader, {})).toEqual([])
    }
    for (const level of [1, 2]) {
      expect(await options('place', level, ids.stranger, {})).toEqual([])
    }
  })
})
