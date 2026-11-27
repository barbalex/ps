import { afterAll, beforeAll, expect, it } from 'vitest'
import { createTestDb, type TestFixture } from './helpers/createTestDb.ts'

let fixture: TestFixture
const point = { type: 'Point', coordinates: [7, 46, 900] }
const polygon = {
  type: 'Polygon',
  coordinates: [
    [
      [7, 46],
      [8, 46],
      [8, 47],
      [7, 46],
    ],
  ],
}
const claim = (id: string) =>
  fixture.db.query(`SELECT set_config('request.jwt.claims', $1, false)`, [
    JSON.stringify({ user_id: id }),
  ])
const load = (
  table: string,
  rows: Record<string, unknown[]>,
  mode = 'append',
) =>
  fixture.db.query('SELECT import_own_geometries($1,$2,$3) AS n', [
    table,
    JSON.stringify(rows),
    mode,
  ])

beforeAll(async () => {
  fixture = await createTestDb([
    '12_writePermissionTriggers.sql',
    '23_importOwnGeometries.sql',
  ])
  await fixture.db.exec('SET ROLE app_user')
})
afterAll(() => fixture?.db.close())

it('groups geometries per existing row, updates bounds and rolls the entire batch back on an unmatched ID', async () => {
  const { db, ids } = fixture
  await claim(ids.writer)
  expect(
    (
      await load('places', {
        [ids.place]: [point, point],
        [ids.otherPlace]: [point],
      })
    ).rows,
  ).toEqual([{ n: 2 }])
  await load('places', {
    [ids.place]: [{ type: 'Point', coordinates: [9, 48] }],
  })
  await expect(
    load(
      'places',
      { [ids.place]: [point], 'ffffffff-ffff-4fff-8fff-ffffffffffff': [point] },
      'replace',
    ),
  ).rejects.toMatchObject({ code: '42501' })
  await db.exec('RESET ROLE')
  expect(
    (
      await db.query(
        'SELECT ST_NumGeometries(geometry) AS n,bbox,updated_by FROM places WHERE place_id=$1',
        [ids.place],
      )
    ).rows,
  ).toEqual([{ n: 3, bbox: [7, 46, 9, 48], updated_by: 'writer@example.com' }])
  await db.exec('SET ROLE app_user')
  await load('places', { [ids.place]: [point] }, 'replace')
  await load('actions', { [ids.action]: [point] })
  await db.exec('RESET ROLE')
  const {
    rows: [check],
  } = await db.query<{ check_id: string }>(
    'INSERT INTO checks(place_id) VALUES ($1) RETURNING check_id',
    [ids.place],
  )
  expect(
    (
      await db.query(
        'SELECT ST_NumGeometries(geometry) AS n FROM places WHERE place_id=$1',
        [ids.place],
      )
    ).rows,
  ).toEqual([{ n: 1 }])
  await db.exec('SET ROLE app_user')
  await load('checks', { [check.check_id]: [point] })
  await claim(ids.reader)
  await expect(load('places', { [ids.place]: [point] })).rejects.toMatchObject({
    code: '42501',
  })
  await expect(
    load('actions', { [ids.action]: [point] }),
  ).rejects.toMatchObject({ code: '42501' })
})

it('requires a designer and polygons for project boundaries; derived observation geometry cannot be targeted', async () => {
  const { ids } = fixture
  await claim(ids.writer)
  await expect(
    load('projects', { [ids.project]: [polygon] }),
  ).rejects.toMatchObject({ code: '42501' })
  await claim(ids.designer)
  await expect(
    load('projects', { [ids.project]: [polygon, point] }),
  ).rejects.toThrow('require polygons')
  await load('projects', { [ids.project]: [polygon] })
  await load('projects', { [ids.project]: [polygon] })
  await expect(
    load('observations', { [ids.project]: [point] }),
  ).rejects.toThrow('Unsupported geometry table')
})
