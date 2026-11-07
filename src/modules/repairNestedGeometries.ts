import type { PGlite } from '@electric-sql/pglite'

// PostGIS accepts GeometryCollections nested inside GeometryCollections, but
// ST_AsGeoJSON rejects them with "GeoJson: geometry not supported." — which
// breaks every live query that serializes geometry for the map. This module
// prevents creating nested collections and flattens existing ones at boot.

type QueryableDb = Pick<PGlite, 'query'>

const flattenGeometries = (
  geometries: GeoJSON.Geometry[],
): GeoJSON.Geometry[] =>
  geometries.flatMap((geometry) =>
    geometry.type === 'GeometryCollection'
      ? flattenGeometries(geometry.geometries)
      : [geometry],
  )

const toGeometryCollection = (geometries: GeoJSON.Geometry[]) => ({
  type: 'GeometryCollection' as const,
  geometries: flattenGeometries(geometries),
})

// Converts drawn features into a flat GeometryCollection for the geometry
// columns (their typmod only accepts GeometryCollection).
// Loading an existing geometry into the draw layer and persisting it again
// would otherwise nest the collection one level deeper on every edit.
export const flattenToGeometryCollection = (features: GeoJSON.Feature[]) =>
  toGeometryCollection(
    features.map((feature) => feature.geometry).filter(Boolean),
  )

const GEOMETRY_TABLES = [
  { table: 'places', idName: 'place_id' },
  { table: 'checks', idName: 'check_id' },
  { table: 'actions', idName: 'action_id' },
  { table: 'observations', idName: 'observation_id' },
  { table: 'vector_layer_geoms', idName: 'vector_layer_geom_id' },
] as const

// Flattens every geometry that contains nested GeometryCollections, so that
// ST_AsGeoJSON works on all rows again. No-op (SELECT-only) when clean.
export const repairNestedGeometries = async (db: QueryableDb): Promise<void> => {
  for (const { table, idName } of GEOMETRY_TABLES) {
    // ST_Dump flattens recursively, so a dump with more rows than the
    // top-level member count means the geometry contains nested collections
    const candidates = await db.query(
      `SELECT ${idName} AS id FROM ${table}
       WHERE geometry IS NOT NULL
         AND (SELECT count(*) FROM ST_Dump(geometry)) > ST_NumGeometries(geometry)`,
    )
    for (const row of candidates.rows as { id: string }[]) {
      const leaves = await db.query(
        `SELECT ST_AsGeoJSON((ST_Dump(geometry)).geom)::json AS geometry
         FROM ${table} WHERE ${idName} = $1`,
        [row.id],
      )
      const geometries = (
        leaves.rows as { geometry: GeoJSON.Geometry | null }[]
      )
        .map((leaf) => leaf.geometry)
        .filter(
          (geometry): geometry is GeoJSON.Geometry => geometry !== null,
        )
      if (!geometries.length) continue
      await db.query(
        `UPDATE ${table} SET geometry = ST_GeomFromGeoJSON($1) WHERE ${idName} = $2`,
        [JSON.stringify(toGeometryCollection(geometries)), row.id],
      )
    }
  }
}
