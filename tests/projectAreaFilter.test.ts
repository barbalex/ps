import { beforeAll, afterAll, expect, it } from 'vitest'

import { createTestDb, type TestFixture } from './helpers/createTestDb.ts'
import {
  andFilters,
  projectAreaFilter,
} from '../src/modules/projectAreaFilter.ts'
import { spatialListQuery } from '../src/modules/spatialListQuery.ts'

let fixture: TestFixture
const child = '30000000-0000-7000-8000-000000000033'
const crossing =
  "ST_GeomFromText('GEOMETRYCOLLECTION(LINESTRING(1 1,3 3))',4326)"
const edge = "ST_GeomFromText('GEOMETRYCOLLECTION(POINT(0 1))',4326)"

beforeAll(async () => {
  fixture = await createTestDb()
  const { db, ids } = fixture
  await db.exec(`
    UPDATE projects SET geometry=ST_Multi(ST_MakeEnvelope(0,0,2,2,4326))
      WHERE project_id='${ids.project}';
    UPDATE places SET geometry=${crossing} WHERE place_id='${ids.place}';
    INSERT INTO places(place_id,subproject_id,parent_id,level)
      VALUES ('${child}','${ids.subproject}','${ids.place}',2);
    INSERT INTO checks(place_id,geometry) VALUES ('${child}',${edge});
    UPDATE actions SET geometry=${crossing} WHERE action_id='${ids.action}';
    INSERT INTO observations(place_id,geometry) VALUES ('${child}',${edge}),('${child}',${crossing}),('${child}',NULL);
  `)
})
afterAll(async () => fixture.db.close())

it('retains the path to matching grandchildren only for navigation', async () => {
  const { db, ids } = fixture
  const area = projectAreaFilter(ids.project, 'inside')
  const select = (where: string, filter: string) =>
    db.query(
      spatialListQuery({
        open: true,
        select: 'place_id AS id, label',
        from: 'places',
        where,
        filter,
      }),
    )
  const roots = 'parent_id IS NULL'
  const direct = (await select(roots, area.matches('places'))).rows
  expect(direct).toMatchObject([
    { id: null, count_filtered: 0, count_unfiltered: 2 },
  ])
  expect((await select(roots, area.navigationPlaces(true))).rows).toMatchObject(
    [{ id: ids.place, count_filtered: 1, count_unfiltered: 2 }],
  )
  expect(
    (await select(`parent_id='${ids.place}'`, area.navigationPlaces(false)))
      .rows,
  ).toMatchObject([{ id: child }])
})

it('uses each record’s geometry, excludes missing data and combines attribute rules', async () => {
  const { db, ids } = fixture
  for (const [table, singular, inside, outside] of [
    ['actions', 'action', 0, 1],
    ['checks', 'check', 1, 0],
    ['observations', 'observation', 1, 1],
  ] as const) {
    for (const [mode, expected] of [
      ['inside', inside],
      ['outside', outside],
    ] as const) {
      const filter = andFilters(
        'place_id IS NOT NULL OR place_id IS NULL',
        projectAreaFilter(ids.project, mode).matches(table),
      )
      const rows = await db.query(
        spatialListQuery({
          open: false,
          select: `${singular}_id AS id, label`,
          where: 'TRUE',
          from: table,
          filter,
        }),
      )
      expect(rows.rows[0]?.count_filtered).toBe(expected)
    }
  }
})
