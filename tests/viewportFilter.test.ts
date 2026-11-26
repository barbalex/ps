import { describe, it, expect, beforeAll, afterAll } from 'vitest'

import { createTestDb, type TestFixture } from './helpers/createTestDb.ts'
import {
  uploadFeature,
  uploadFeaturesSql,
  type UploadRow,
} from '../src/components/Map/layers/VectorLayer/uploadFeatures.ts'
import {
  viewportEitherPredicate,
  viewportParams,
  viewportPredicate,
} from '../src/components/Map/layers/viewportEnvelope.ts'

let fixture: TestFixture

// places around Zurich city centre (8.54, 47.37), like tests/geoQueries.test.ts
const placeIds = {
  polygon: '30000000-0000-7000-8000-000000000201', // 8.53–8.55 × 47.36–47.38
  pointNear: '30000000-0000-7000-8000-000000000202', // point at 8.54, 47.371
  far: '30000000-0000-7000-8000-000000000203', // point at 9.5, 48.0
}

const observationImportId = '70000000-0000-7000-8000-000000000001'
const observationIds = {
  near: '80000000-0000-7000-8000-000000000001', // near obs → polygon place
  farObsNearPlace: '80000000-0000-7000-8000-000000000002', // far obs → polygon place
  nearObsFarPlace: '80000000-0000-7000-8000-000000000003', // near obs → far place
  far: '80000000-0000-7000-8000-000000000004', // far obs → far place
}

// what useViewportEnvelope would emit for a Zurich viewport
const zurichEnvelope = {
  swLng: 8.52,
  swLat: 47.36,
  neLng: 8.56,
  neLat: 47.38,
}

// the Places1 layer's query shape: viewport predicate + edit_version
const placesSql = `
  SELECT place_id, label,
    (SELECT max(t.updated_at) FROM places t
      WHERE t.parent_id IS NULL AND t.subproject_id = $1 AND t.geometry IS NOT NULL) AS edit_version
  FROM places
  WHERE parent_id IS NULL AND subproject_id = $1 AND geometry IS NOT NULL${viewportPredicate('places.geometry')}`

// the ObservationsAssignedLines1 layer's query shape (ids only)
const linesSql = `
  SELECT o.observation_id
  FROM observations o
    INNER JOIN observation_imports oi ON o.observation_import_id = oi.observation_import_id
    INNER JOIN places p ON o.place_id = p.place_id
  WHERE
    o.geometry IS NOT NULL
    AND p.geometry IS NOT NULL
    AND oi.subproject_id = $1
    AND p.parent_id IS NULL${viewportEitherPredicate('o.geometry', 'p.geometry')}`

const queryPlaceIds = async (params: unknown[]) =>
  (
    (await fixture.db.query(placesSql, params))
      .rows as { place_id: string }[]
  ).map((row) => row.place_id).sort()

const queryObservationIds = async (params: unknown[]) =>
  (
    (await fixture.db.query(linesSql, params))
      .rows as { observation_id: string }[]
  ).map((row) => row.observation_id).sort()

const queryEditVersion = async () => {
  const res = await fixture.db.query(placesSql, [
    fixture.ids.subproject,
    ...viewportParams(zurichEnvelope),
  ])
  const version = (res.rows[0] as { edit_version: string | Date | null })
    .edit_version
  // pglite hands timestamptz back as Date — compare at full precision
  return typeof version === 'object' ? version.getTime() : version
}

beforeAll(async () => {
  fixture = await createTestDb()
  await fixture.db.exec(`
    INSERT INTO observation_imports (observation_import_id, subproject_id)
      VALUES ('${observationImportId}', '${fixture.ids.subproject}');

    INSERT INTO places (place_id, subproject_id, level, label, geometry) VALUES
      ('${placeIds.polygon}', '${fixture.ids.subproject}', 1, 'polygon',
        ST_GeomFromGeoJSON('{"type":"GeometryCollection","geometries":[{"type":"Polygon","coordinates":[[[8.53,47.36],[8.55,47.36],[8.55,47.38],[8.53,47.38],[8.53,47.36]]]}]}')),
      ('${placeIds.pointNear}', '${fixture.ids.subproject}', 1, 'point near',
        ST_GeomFromGeoJSON('{"type":"GeometryCollection","geometries":[{"type":"Point","coordinates":[8.54,47.371]}]}')),
      ('${placeIds.far}', '${fixture.ids.subproject}', 1, 'far',
        ST_GeomFromGeoJSON('{"type":"GeometryCollection","geometries":[{"type":"Point","coordinates":[9.5,48.0]}]}'));

    INSERT INTO observations (observation_id, observation_import_id, place_id, label, geometry) VALUES
      ('${observationIds.near}', '${observationImportId}', '${placeIds.polygon}', 'near',
        ST_GeomFromGeoJSON('{"type":"GeometryCollection","geometries":[{"type":"Point","coordinates":[8.54,47.37]}]}')),
      ('${observationIds.farObsNearPlace}', '${observationImportId}', '${placeIds.polygon}', 'far obs, near place',
        ST_GeomFromGeoJSON('{"type":"GeometryCollection","geometries":[{"type":"Point","coordinates":[9.5,48.0]}]}')),
      ('${observationIds.nearObsFarPlace}', '${observationImportId}', '${placeIds.far}', 'near obs, far place',
        ST_GeomFromGeoJSON('{"type":"GeometryCollection","geometries":[{"type":"Point","coordinates":[8.54,47.37]}]}')),
      ('${observationIds.far}', '${observationImportId}', '${placeIds.far}', 'far',
        ST_GeomFromGeoJSON('{"type":"GeometryCollection","geometries":[{"type":"Point","coordinates":[9.5,48.0]}]}'));
  `)
})

afterAll(async () => {
  await fixture.db.close()
})

it('uploads return intersecting features, respect the cap, and refresh a changed row', async () => {
  const { db, ids } = fixture
  const { rows: [layer] } = await db.query<{ id: string }>(
    `INSERT INTO vector_layers(project_id, type) VALUES ($1, 'upload') RETURNING vector_layer_id AS id`,
    [ids.project],
  )
  await db.query(`
    INSERT INTO vector_layer_geoms(vector_layer_id, geometry, properties)
    VALUES ($1, ST_GeomFromText('GEOMETRYCOLLECTION(LINESTRING(8 47.37, 9 47.37))', 4326), '{"kind":"line"}'),
           ($1, ST_GeomFromText('GEOMETRYCOLLECTION(POINT(1 1))', 4326), '{}')`, [layer.id])
  const read = async (bounds: typeof zurichEnvelope | null, cap = 10) =>
    (await db.query<UploadRow>(uploadFeaturesSql, [layer.id, ...viewportParams(bounds), cap])).rows.map(uploadFeature)
  expect(await read(null)).toEqual([])
  expect(await read(zurichEnvelope, 0)).toEqual([])
  const visible = await read(zurichEnvelope)
  expect(visible).toHaveLength(1)
  expect(visible[0]).toMatchObject({
    geometry: { type: 'LineString' },
    properties: { kind: 'line' },
  })
  await db.query(`UPDATE vector_layer_geoms SET properties = '{"kind":"updated"}' WHERE vector_layer_id = $1`, [layer.id])
  const [updated] = await read(zurichEnvelope)
  expect(updated.properties).toEqual({ kind: 'updated' })
  expect(updated.id).not.toBe(visible[0].id)
})

describe('viewportPredicate (places/actions/checks layers)', () => {
  it('returns only geometries whose bbox intersects the envelope', async () => {
    const ids = await queryPlaceIds([
      fixture.ids.subproject,
      ...viewportParams(zurichEnvelope),
    ])
    expect(ids).toEqual([placeIds.polygon, placeIds.pointNear])
  })

  it('returns everything when the envelope params are NULL (boot window)', async () => {
    const ids = await queryPlaceIds([
      fixture.ids.subproject,
      ...viewportParams(null),
    ])
    expect(ids).toEqual([placeIds.polygon, placeIds.pointNear, placeIds.far])
  })

  it('edit_version is the same regardless of the envelope', async () => {
    const bounded = await fixture.db.query(placesSql, [
      fixture.ids.subproject,
      ...viewportParams(zurichEnvelope),
    ])
    const unbounded = await fixture.db.query(placesSql, [
      fixture.ids.subproject,
      ...viewportParams(null),
    ])
    expect(
      String((bounded.rows[0] as { edit_version: unknown }).edit_version),
    ).toBe(
      String((unbounded.rows[0] as { edit_version: unknown }).edit_version),
    )
  })

  it('edit_version bumps on a local edit outside the envelope', async () => {
    const before = await queryEditVersion()
    // the far place lies outside the Zurich envelope — still in the
    // unfiltered scope, and the client-side updated_at trigger bumps it
    await fixture.db.query(
      `UPDATE places SET label = 'renamed' WHERE place_id = $1`,
      [placeIds.far],
    )
    const after = await queryEditVersion()
    expect(after).not.toBe(before)
  })
})

describe('viewportEitherPredicate (assignment lines layers)', () => {
  it('loads a line when either endpoint intersects the envelope', async () => {
    const ids = await queryObservationIds([
      fixture.ids.subproject,
      ...viewportParams(zurichEnvelope),
    ])
    expect(ids).toEqual([
      observationIds.near,
      observationIds.farObsNearPlace,
      observationIds.nearObsFarPlace,
    ])
  })

  it('returns everything when the envelope params are NULL', async () => {
    const ids = await queryObservationIds([
      fixture.ids.subproject,
      ...viewportParams(null),
    ])
    expect(ids).toEqual([
      observationIds.near,
      observationIds.farObsNearPlace,
      observationIds.nearObsFarPlace,
      observationIds.far,
    ])
  })
})
