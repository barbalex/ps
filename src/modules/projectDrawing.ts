import type { QueryableDb } from './geoQueries.ts'

export const projectDesignSql = `
  SELECT EXISTS (
    SELECT 1 FROM project_roles pr JOIN project_users pu USING (project_user_id)
    WHERE pr.project_id = $1 AND pr.role IN ('design', 'own')
      AND (pu.auth_user_id = $2 OR pu.email = (SELECT email FROM users WHERE user_id = $2))
  ) AS allowed`

// Each polygon is its own editable/removable Leaflet layer; interior rings
// remain part of that layer rather than being mistaken for separate islands.
export const drawingMembers = (
  geometry: GeoJSON.MultiPolygon | GeoJSON.GeometryCollection | null,
): GeoJSON.Geometry[] =>
  geometry?.type === 'MultiPolygon' ?
    geometry.coordinates.map((coordinates) => ({
      type: 'Polygon',
      coordinates,
    }))
  : (geometry?.geometries ?? [])

export const toProjectGeometry = (
  members: GeoJSON.Geometry[],
): GeoJSON.MultiPolygon | null => {
  const coordinates = members.flatMap((g) => {
    if (g.type === 'MultiPolygon') return g.coordinates
    if (g.type === 'Polygon') return [g.coordinates]
    throw new Error('Project areas must contain only polygons.')
  })
  return coordinates.length ? { type: 'MultiPolygon', coordinates } : null
}

export const projectGeometryField =
  'ST_AsGeoJSON(geometry, 17)::json AS geometry'

export class ProjectAreaPermissionError extends Error {}

export const writeProjectGeometry = async (
  db: QueryableDb,
  projectId: string,
  userId: string | null,
  geometry: GeoJSON.MultiPolygon | GeoJSON.GeometryCollection | null,
) => {
  if (geometry && geometry.type !== 'MultiPolygon')
    throw new Error('Project areas must be multipolygons.')
  const { rows } = await db.query<{ geometry: GeoJSON.MultiPolygon | null }>(
    `UPDATE projects SET geometry = ST_GeomFromGeoJSON($3::text)
     WHERE project_id = $1 AND (${projectDesignSql}) RETURNING ${projectGeometryField}`,
    [projectId, userId, geometry && JSON.stringify(geometry)],
  )
  if (!rows[0]) throw new ProjectAreaPermissionError()
  return rows[0]
}
