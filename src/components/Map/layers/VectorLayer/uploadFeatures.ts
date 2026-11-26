import type { Feature, GeometryCollection } from 'geojson'

// Unlike the unlimited table layers, use the actual viewport: a padded or
// stale envelope can spend the feature limit on off-screen rows after a zoom.
export const uploadFeaturesSql = `
  SELECT vector_layer_geom_id AS id, updated_at::text AS revision,
    ST_AsGeoJSON(geometry)::json AS geometry, properties
  FROM vector_layer_geoms
  WHERE vector_layer_id = $1 AND $2::float8 IS NOT NULL
    AND geometry && ST_MakeEnvelope($2, $3, $4, $5, 4326)
  ORDER BY vector_layer_geom_id
  LIMIT $6`

export type UploadRow = {
  id: string
  revision: string
  geometry: GeometryCollection
  properties: Feature['properties']
}

export const uploadFeature = ({
  id,
  revision,
  geometry,
  properties,
}: UploadRow): Feature => ({
  type: 'Feature',
  // Edits must replace a rendered feature, while pans keep unchanged rows.
  id: `${id}@${revision}`,
  geometry:
    geometry.geometries.length === 1 ? geometry.geometries[0] : geometry,
  properties,
})
