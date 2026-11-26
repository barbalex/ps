import { describe, it, expect, beforeAll, afterAll } from 'vitest'

import { createTestDb, type TestFixture } from './helpers/createTestDb.ts'
import { previewPolygonEdit } from '../src/modules/walkPolygonEdit.ts'
import {
  nearestPlaces,
  PLACES_WITH_DISTANCE_SQL,
  extentSelect,
  queryExtent,
  extentFromRow,
  unionExtents,
  extentFromBbox,
  extentToBoundsWithMargin,
  type ExtentRow,
} from '../src/modules/geoQueries.ts'
import {
  repairNestedGeometries,
  flattenToGeometryCollection,
} from '../src/modules/repairNestedGeometries.ts'

let fixture: TestFixture

// places around Zurich city centre (8.54, 47.37)
const TEST_POINT = { lng: 8.54, lat: 47.37 }
const placeIds = {
  polygon: '30000000-0000-7000-8000-000000000101' // contains TEST_POINT
  ,
  pointNear: '30000000-0000-7000-8000-000000000102' // ~111 m north
  ,
  mixed: '30000000-0000-7000-8000-000000000103' // Point + LineString members
  ,
  far: '30000000-0000-7000-8000-000000000104' // > 100 km away
  ,
  level2: '30000000-0000-7000-8000-000000000105' // child of polygon, ~8 m east
  ,
  empty: '30000000-0000-7000-8000-000000000106' // GeometryCollection []
  ,
  nested: '30000000-0000-7000-8000-000000000107' // GeometryCollection[
    //   GeometryCollection[Point, LineString], Point] — the shape older
    //   versions of the draw control persisted, which ST_AsGeoJSON rejects
}

beforeAll(async () => {
  fixture = await createTestDb()
  await fixture.db.exec(`
    INSERT INTO places (place_id, subproject_id, level, label, geometry) VALUES
      ('${placeIds.polygon}', '${fixture.ids.subproject}', 1, 'a polygon',
        ST_GeomFromGeoJSON('{"type":"GeometryCollection","geometries":[{"type":"Polygon","coordinates":[[[8.53,47.36],[8.55,47.36],[8.55,47.38],[8.53,47.38],[8.53,47.36]]]}]}')),
      ('${placeIds.pointNear}', '${fixture.ids.subproject}', 1, 'b point near',
        ST_GeomFromGeoJSON('{"type":"GeometryCollection","geometries":[{"type":"Point","coordinates":[8.54,47.371]}]}')),
      ('${placeIds.mixed}', '${fixture.ids.subproject}', 1, 'c mixed',
        ST_GeomFromGeoJSON('{"type":"GeometryCollection","geometries":[{"type":"Point","coordinates":[8.54,47.371]},{"type":"LineString","coordinates":[[8.54,47.372],[8.54,47.373]]}]}')),
      ('${placeIds.far}', '${fixture.ids.subproject}', 1, 'd far',
        ST_GeomFromGeoJSON('{"type":"GeometryCollection","geometries":[{"type":"Point","coordinates":[9.5,48.0]}]}')),
      ('${placeIds.level2}', '${fixture.ids.subproject}', 2, 'e level2 point',
        ST_GeomFromGeoJSON('{"type":"GeometryCollection","geometries":[{"type":"Point","coordinates":[8.5401,47.37]}]}')),
      ('${placeIds.empty}', '${fixture.ids.subproject}', 1, 'f empty',
        ST_GeomFromGeoJSON('{"type":"GeometryCollection","geometries":[]}')),
      ('${placeIds.nested}', '${fixture.ids.subproject}', 1, 'g nested',
        ST_GeomFromGeoJSON('{"type":"GeometryCollection","geometries":[{"type":"GeometryCollection","geometries":[{"type":"Point","coordinates":[8.545,47.375]},{"type":"LineString","coordinates":[[8.545,47.376],[8.546,47.377]]}]},{"type":"Point","coordinates":[8.547,47.378]}]}'));
    UPDATE places SET parent_id = '${placeIds.polygon}'
    WHERE place_id = '${placeIds.level2}';
  `)
})

afterAll(async () => {
  await fixture.db.close()
})

describe('recorded polygon edits', () => {
  const square: GeoJSON.Polygon = {
    type: 'Polygon',
    coordinates: [
      [
        [8, 47],
        [8.01, 47],
        [8.01, 47.01],
        [8, 47.01],
        [8, 47],
      ],
    ],
  }
  const hole: GeoJSON.Polygon = {
    type: 'Polygon',
    coordinates: [
      [
        [8.001, 47.005],
        [8.002, 47.005],
        [8.002, 47.006],
        [8.001, 47.005],
      ],
    ],
  }
  const path = (...coordinates: number[][]): GeoJSON.LineString => ({
    type: 'LineString',
    coordinates,
  })
  it('cuts only a strictly interior hole and preserves it when splitting', async () => {
    const cut = await previewPolygonEdit(fixture.db, 'hole', square, hole)
    expect(cut?.shapes[0].coordinates).toHaveLength(2)
    expect(
      await previewPolygonEdit(fixture.db, 'hole', square, square),
    ).toBeNull()
    const split = await previewPolygonEdit(
      fixture.db,
      'split',
      cut!.shapes[0],
      path([8.005, 46.999], [8.005, 47.011]),
    )
    expect(split?.shapes.map((g) => g.coordinates.length).sort()).toEqual([
      1, 2,
    ])
    expect(
      await previewPolygonEdit(
        fixture.db,
        'split',
        square,
        path([8, 47], [8.001, 47.001]),
      ),
    ).toBeNull()
  })
  it('previews both arcs and snapped joins; rejects distant endpoints', async () => {
    const walked = path([8.002, 46.99999], [8.004, 46.999], [8.006, 46.99999])
    const changed = await previewPolygonEdit(
      fixture.db,
      'reshape',
      square,
      walked,
    )
    expect(changed?.removed?.coordinates).toEqual([
      [8.002, 47],
      [8.006, 47],
    ])
    expect(changed?.shapes[0].coordinates[0]).toContainEqual([8.004, 46.999])
    const other = await previewPolygonEdit(
      fixture.db,
      'reshape',
      square,
      walked,
      true,
    )
    expect(other?.removed?.coordinates).toContainEqual([8.01, 47.01])
    expect(
      await previewPolygonEdit(
        fixture.db,
        'reshape',
        square,
        path([7.99, 47], [8.006, 47]),
      ),
    ).toBeNull()
  })
})

describe('nearestPlaces', () => {
  it('only offers assignment targets inside the visible map scope', async () => {
    const options = { ...TEST_POINT, maxDistanceM: 20 }
    const { project: projectId, subproject: subprojectId } = fixture.ids
    const other = '10000000-0000-7000-8000-000000000099'
    const targets = (scope: { projectId: string; subprojectId?: string }) =>
      nearestPlaces(fixture.db, { ...options, scope })
    expect(await targets({ projectId })).toContainEqual(expect.objectContaining({ place_id: placeIds.polygon }))
    expect(await targets({ projectId, subprojectId })).toContainEqual(expect.objectContaining({ place_id: placeIds.polygon }))
    expect(await targets({ projectId: other })).toEqual([])
    expect(await targets({ projectId, subprojectId: other })).toEqual([])
  })
  it('returns containing place with distance 0, nearest first', async () => {
    const rows = await nearestPlaces(fixture.db, {
      lng: TEST_POINT.lng,
      lat: TEST_POINT.lat,
      maxDistanceM: 500,
    })
    const ids = rows.map((row) => row.place_id)
    expect(ids).toContain(placeIds.polygon)
    expect(rows[0]!.place_id).toBe(placeIds.polygon)
    expect(rows[0]!.distance_m).toBe(0)
    // excludes the far place
    expect(ids).not.toContain(placeIds.far)
    // ascending order
    const distances = rows.map((row) => row.distance_m)
    expect([...distances].sort((a, b) => a! - b!)).toEqual(distances)
  })

  it('measures geodesic meters (point ~111 m north, level2 ~8 m east)', async () => {
    const rows = await nearestPlaces(fixture.db, {
      lng: TEST_POINT.lng,
      lat: TEST_POINT.lat,
      maxDistanceM: 500,
    })
    const byId = Object.fromEntries(rows.map((row) => [row.place_id, row]))
    expect(byId[placeIds.pointNear]!.distance_m).toBeGreaterThan(100)
    expect(byId[placeIds.pointNear]!.distance_m).toBeLessThan(125)
    expect(byId[placeIds.level2]!.distance_m).toBeGreaterThan(5)
    expect(byId[placeIds.level2]!.distance_m).toBeLessThan(12)
  })

  it('handles mixed GeometryCollection members without error', async () => {
    const rows = await nearestPlaces(fixture.db, {
      lng: TEST_POINT.lng,
      lat: TEST_POINT.lat,
      maxDistanceM: 500,
    })
    const mixed = rows.find((row) => row.place_id === placeIds.mixed)
    // nearest member is the Point at ~111 m
    expect(mixed?.distance_m).toBeGreaterThan(100)
    expect(mixed?.distance_m).toBeLessThan(125)
  })

  it('filters by place level (parent_id)', async () => {
    const level1 = await nearestPlaces(fixture.db, {
      lng: TEST_POINT.lng,
      lat: TEST_POINT.lat,
      maxDistanceM: 500,
      level: 'places1',
    })
    expect(level1.map((row) => row.place_id)).not.toContain(placeIds.level2)

    const level2 = await nearestPlaces(fixture.db, {
      lng: TEST_POINT.lng,
      lat: TEST_POINT.lat,
      maxDistanceM: 500,
      level: 'places2',
    })
    expect(level2.map((row) => row.place_id)).toEqual([placeIds.level2])
  })

  it('respects maxDistanceM and limit', async () => {
    const nearby = await nearestPlaces(fixture.db, {
      lng: TEST_POINT.lng,
      lat: TEST_POINT.lat,
      maxDistanceM: 10,
    })
    // only the containing polygon and the ~8 m level2 point
    expect(nearby.map((row) => row.place_id).sort()).toEqual([
      placeIds.polygon,
      placeIds.level2,
    ])

    const limited = await nearestPlaces(fixture.db, {
      lng: TEST_POINT.lng,
      lat: TEST_POINT.lat,
      maxDistanceM: 500,
      limit: 2,
    })
    expect(limited).toHaveLength(2)
  })
})

describe('PLACES_WITH_DISTANCE_SQL', () => {
  it('returns all places with distance in meters, nearest first', async () => {
    const res = await fixture.db.query(PLACES_WITH_DISTANCE_SQL, [
      TEST_POINT.lng,
      TEST_POINT.lat,
    ])
    const rows = res.rows as {
      place_id: string
      label: string | null
      distance_m: number | null
    }[]
    // empty geometry yields NULL distance, sorted last
    expect(rows).toHaveLength(7)
    expect(rows[0]!.place_id).toBe(placeIds.polygon)
    expect(rows[0]!.distance_m).toBe(0)
    expect(rows.at(-1)!.place_id).toBe(placeIds.empty)
    expect(rows.at(-1)!.distance_m).toBeNull()
  })

  it('returns NULL distances for NULL point parameters', async () => {
    const res = await fixture.db.query(PLACES_WITH_DISTANCE_SQL, [null, null])
    const rows = res.rows as { distance_m: number | null }[]
    expect(rows).toHaveLength(7)
    expect(rows.every((row) => row.distance_m === null)).toBe(true)
  })
})

describe('extent helpers', () => {
  it('queryExtent returns the bbox of matching geometries', async () => {
    const extent = await queryExtent(
      fixture.db,
      `SELECT ${extentSelect()} FROM places WHERE place_id = $1`,
      [placeIds.mixed],
    )
    expect(extent).not.toBeNull()
    expect(extent!.xMin).toBeCloseTo(8.54, 6)
    expect(extent!.yMin).toBeCloseTo(47.371, 6)
    expect(extent!.xMax).toBeCloseTo(8.54, 6)
    expect(extent!.yMax).toBeCloseTo(47.373, 6)
  })

  it('queryExtent returns null when nothing matches', async () => {
    const extent = await queryExtent(
      fixture.db,
      `SELECT ${extentSelect()} FROM places WHERE geometry IS NULL`,
    )
    expect(extent).toBeNull()
  })

  it('extentFromRow reads an extent row the way queryExtent does', async () => {
    const sql = `SELECT ${extentSelect()} FROM places WHERE place_id = $1`
    const res = await fixture.db.query(sql, [placeIds.mixed])
    expect(extentFromRow(res.rows[0] as ExtentRow)).toEqual(
      await queryExtent(fixture.db, sql, [placeIds.mixed]),
    )

    // no row, an empty GeometryCollection and a missing geometry: no extent
    expect(extentFromRow(undefined)).toBeNull()
    expect(
      extentFromRow({ x_min: null, y_min: null, x_max: null, y_max: null }),
    ).toBeNull()
    expect(
      extentFromRow({ x_min: 8.5, y_min: 47.3, x_max: null, y_max: 47.4 }),
    ).toBeNull()
    const empty = await fixture.db.query(sql, [placeIds.empty])
    expect(extentFromRow(empty.rows[0] as ExtentRow)).toBeNull()
  })

  it('unionExtents merges and ignores nulls', () => {
    const union = unionExtents([
      null,
      { xMin: 8, yMin: 47, xMax: 9, yMax: 48 },
      { xMin: 8.5, yMin: 46, xMax: 10, yMax: 47.5 },
    ])
    expect(union).toEqual({ xMin: 8, yMin: 46, xMax: 10, yMax: 48 })
    expect(unionExtents([null, null])).toBeNull()
  })

  it('extentFromBbox and extentToBoundsWithMargin convert shapes', () => {
    const extent = extentFromBbox([8.5, 47.3, 8.6, 47.4])
    expect(extentToBoundsWithMargin(extent, 0.01)).toEqual([
      [47.29, 8.49],
      [47.41, 8.61],
    ])
  })
})

describe('geometry center for assignment lines', () => {
  it('envelope centroid equals the turf-bbox center', async () => {
    const res = await fixture.db.query(
      `SELECT ST_AsGeoJSON(ST_Centroid(ST_Envelope(geometry)))::json AS center
       FROM places WHERE place_id = $1`,
      [placeIds.mixed],
    )
    const center = (res.rows[0] as { center: { coordinates: number[] } })
      .center.coordinates
    expect(center[0]).toBeCloseTo(8.54, 6)
    expect(center[1]).toBeCloseTo((47.371 + 47.373) / 2, 6)
  })
})

describe('nested GeometryCollection repair', () => {
  it('ST_AsGeoJSON rejects the nested geometry before the repair', async () => {
    await expect(
      fixture.db.query(`SELECT ST_AsGeoJSON(geometry) FROM places WHERE place_id = $1`, [
        placeIds.nested,
      ]),
    ).rejects.toThrow('GeoJson: geometry not supported.')
  })

  it('repairNestedGeometries flattens it and keeps every member', async () => {
    await repairNestedGeometries(fixture.db)
    const res = await fixture.db.query(
      `SELECT ST_AsGeoJSON(geometry)::json AS geometry FROM places WHERE place_id = $1`,
      [placeIds.nested],
    )
    const geometry = (
      res.rows[0] as {
        geometry: { type: string; geometries: { type: string }[] }
      }
    ).geometry
    expect(geometry.type).toBe('GeometryCollection')
    expect(geometry.geometries.map((g) => g.type).sort()).toEqual([
      'LineString',
      'Point',
      'Point',
    ])
  })

  it('repairNestedGeometries is idempotent', async () => {
    const before = await fixture.db.query(
      `SELECT geometry::text AS g FROM places WHERE place_id = $1`,
      [placeIds.nested],
    )
    await repairNestedGeometries(fixture.db)
    const after = await fixture.db.query(
      `SELECT geometry::text AS g FROM places WHERE place_id = $1`,
      [placeIds.nested],
    )
    expect((after.rows[0] as { g: string }).g).toBe(
      (before.rows[0] as { g: string }).g,
    )
  })

  it('flattenToGeometryCollection flattens what the draw layer returns', () => {
    const point = { type: 'Point', coordinates: [8.54, 47.37] }
    const flattened = flattenToGeometryCollection([
      {
        type: 'Feature',
        properties: {},
        geometry: {
          type: 'GeometryCollection',
          geometries: [point, { type: 'Point', coordinates: [8.55, 47.38] }],
        },
      },
      { type: 'Feature', properties: {}, geometry: point },
    ])
    expect(flattened.type).toBe('GeometryCollection')
    expect(flattened.geometries).toHaveLength(3)
    expect(
      flattened.geometries.every((g) => g.type === 'Point'),
    ).toBe(true)
  })
})
