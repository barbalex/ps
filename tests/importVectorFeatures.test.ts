import { afterAll, beforeAll, expect, it } from 'vitest'

import { shapeDefinitions } from '../backend/auth/shapeDefinitions.mjs'
import { createTestDb, type TestFixture } from './helpers/createTestDb.ts'

let db: TestFixture['db']
let ids: TestFixture['ids']
const layer = '71000000-0000-7000-8000-000000000001'
const untouched = '71000000-0000-7000-8000-000000000002'
const property = "Survey's class"
const feature = (geometry: unknown, properties: unknown = {}) => ({
  type: 'Feature',
  geometry,
  properties,
})
const point = { type: 'Point', coordinates: [7, 46, 500] }
const line = {
  type: 'LineString',
  coordinates: [
    [6, 48],
    [9, 45],
  ],
}
const claim = (userId: string) =>
  db.query(`SELECT set_config('request.jwt.claims', $1, false)`, [
    JSON.stringify({ role: 'app_user', user_id: userId }),
  ])
const persist = (features: unknown[], mode = 'replace', id = layer) =>
  db.query(`SELECT import_vector_features($1, $2, $3)`, [
    id,
    JSON.stringify(features),
    mode,
  ])
const metadata = async () =>
  (
    await db.query(
      `SELECT feature_count, point_count, line_count, polygon_count, properties, display_by_property
    FROM vector_layers WHERE vector_layer_id = $1`,
      [layer],
    )
  ).rows[0]

beforeAll(async () => {
  ;({ db, ids } = await createTestDb([
    '12_writePermissionTriggers.sql',
    '20_importVectorFeatures.sql',
  ]))
  // Equivalent to 00_roles.sql's default table grants on a real backend.
  await db.exec(
    `GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO app_user; SET ROLE app_user;`,
  )
  await claim(ids.writer)
  await db.query(
    `INSERT INTO vector_layers (vector_layer_id, project_id, type)
     VALUES ($1, $3, 'upload'), ($2, $3, 'upload')`,
    [layer, untouched, ids.project],
  )
  await persist([feature(point)], 'append', untouched)
})
afterAll(() => db?.close())

it('keeps one flat WGS84 collection per feature and recomputes counts/fields over the resulting layer', async () => {
  const nested = {
    type: 'GeometryCollection',
    geometries: [point, { type: 'GeometryCollection', geometries: [line] }],
  }
  await persist([feature(nested, { [property]: 5 })])
  await db.query(
    `UPDATE vector_layers SET display_by_property = $2 WHERE vector_layer_id = $1`,
    [layer, property],
  )
  await db.query(
    `UPDATE vector_layer_displays SET color = '#112233' WHERE vector_layer_id = $1`,
    [layer],
  )
  await persist(
    [
      feature(
        {
          type: 'Polygon',
          coordinates: [
            [
              [7, 47],
              [7, 48],
              [8, 48],
              [7, 47],
            ],
          ],
        },
        { other: false },
      ),
    ],
    'append',
  )
  expect(await metadata()).toEqual({
    feature_count: 2,
    point_count: 1,
    line_count: 1,
    polygon_count: 1,
    properties: [property, 'other'],
    display_by_property: property,
  })
  expect(
    (
      await db.query(
        `SELECT ST_AsGeoJSON(geometry)::json AS geometry, bbox_sw_lng, bbox_ne_lat
    FROM vector_layer_geoms WHERE properties ? $1`,
        [property],
      )
    ).rows,
  ).toEqual([
    {
      geometry: {
        type: 'GeometryCollection',
        geometries: [{ type: 'Point', coordinates: [7, 46] }, line],
      },
      bbox_sw_lng: 6,
      bbox_ne_lat: 48,
    },
  ])
  await persist([feature(line, { [property]: true })])
  expect(
    (
      await db.query(
        `SELECT display_property_value, color FROM vector_layer_displays WHERE vector_layer_id = $1
    ORDER BY display_property_value NULLS FIRST`,
        [layer],
      )
    ).rows,
  ).toEqual([
    { display_property_value: null, color: '#112233' },
    { display_property_value: '5', color: '#3388ff' },
    { display_property_value: 'true', color: '#3388ff' },
  ])
  await persist([feature(point, null)])
  expect(await metadata()).toEqual({
    feature_count: 1,
    point_count: 1,
    line_count: 0,
    polygon_count: 0,
    properties: [],
    display_by_property: null,
  })
  expect(
    (
      await db.query(
        `SELECT 1 FROM vector_layer_geoms WHERE vector_layer_id = $1`,
        [untouched],
      )
    ).rows,
  ).toHaveLength(1)
})

it('rolls back the entire replace, including the delete, on invalid input', async () => {
  await persist([feature(point, { original: true })])
  const before = await metadata()
  await expect(
    persist([
      feature(point),
      feature({ type: 'Point', coordinates: [123456, 56789] }),
    ]),
  ).rejects.toThrow()
  await expect(persist([])).rejects.toThrow()
  await expect(persist([feature(point)], 'typo')).rejects.toThrow()
  expect(await metadata()).toEqual(before)
  expect(
    (
      await db.query(
        `SELECT properties FROM vector_layer_geoms WHERE vector_layer_id = $1`,
        [layer],
      )
    ).rows,
  ).toEqual([{ properties: { original: true } }])
})

it('syncs geometry and styles within project scope but only project writers may modify them', async () => {
  const foreignProject = '10000000-0000-7000-8000-000000000022'
  const foreignLayer = '71000000-0000-7000-8000-000000000022'
  await db.exec(`RESET ROLE; SET electric.syncing = 'true'`)
  await db.query(`INSERT INTO projects (project_id) VALUES ($1)`, [
    foreignProject,
  ])
  await db.query(
    `INSERT INTO vector_layers (vector_layer_id, project_id, type) VALUES ($1,$2,'upload')`,
    [foreignLayer, foreignProject],
  )
  await db.exec(`RESET electric.syncing; SET ROLE app_user`)
  await claim(ids.writer)
  await expect(
    db.query(
      `UPDATE vector_layers SET project_id = $1 WHERE vector_layer_id = $2`,
      [ids.project, foreignLayer],
    ),
  ).rejects.toMatchObject({ code: '42501' })
  for (const [user, rowsVisible] of [
    [ids.reader, true],
    [ids.outsider, false],
  ] as const) {
    await claim(user)
    for (const table of ['vector_layer_geoms', 'vector_layer_displays']) {
      await db.exec(`RESET ROLE`)
      const read = await db.query(
        `SELECT 1 FROM ${table} WHERE vector_layer_id = $2 AND ${shapeDefinitions[table].where}`,
        [user, untouched],
      )
      expect(read.rows.length > 0).toBe(rowsVisible)
      await db.exec(`SET ROLE app_user`)
      const direct = await db.query(
        `SELECT 1 FROM ${table} WHERE vector_layer_id = $1`,
        [untouched],
      )
      expect(direct.rows.length > 0).toBe(rowsVisible)
      await expect(
        db.query(`INSERT INTO ${table} (vector_layer_id) VALUES ($1)`, [
          untouched,
        ]),
      ).rejects.toMatchObject({ code: '42501' })
    }
    await expect(
      persist([feature(point)], 'replace', untouched),
    ).rejects.toMatchObject({ code: '42501' })
  }
  await claim(ids.writer)
  const ownLayer = (
    await db.query<{ id: string }>(
      `INSERT INTO vector_layers (project_id, type) VALUES ($1, 'own') RETURNING vector_layer_id AS id`,
      [ids.project],
    )
  ).rows[0].id
  await expect(
    persist([feature(point)], 'replace', ownLayer),
  ).rejects.toMatchObject({ code: '42501' })
  await db.exec(`SET ROLE web_anon`)
  try {
    await expect(persist([feature(point)])).rejects.toMatchObject({
      code: '42501',
    })
  } finally {
    await db.exec(`RESET ROLE`)
  }
})
