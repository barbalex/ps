import type { PGlite } from '@electric-sql/pglite'

// accepts plain PGlite instances as well as the live-extension wrappers
// that usePGlite() returns
type QueryableDb = Pick<PGlite, 'query'>

// Geospatial queries that run inside PGlite's PostGIS extension instead of
// Turf in JS. Distance is measured on the spheroid by PostGIS (geography)
// and returned in meters.
// All geometry columns are geometry(GeometryCollection, 4326), which the
// geography type does not support — so collection members are unnested with
// ST_GeometryN and cast individually before any ::geography operation.

export type Extent = {
  xMin: number
  yMin: number
  xMax: number
  yMax: number
}

export type PlaceWithDistanceRow = {
  place_id: string
  label: string | null
  distance_m: number | null
}

// per-place distance in meters from the point ($1 = lng, $2 = lat) to the
// nearest member of the place's geometry; NULL point or empty geometry
// yields NULL. Meant for useLiveQuery with [lng, lat] params.
export const PLACES_WITH_DISTANCE_SQL = `
  SELECT p.place_id, p.label, d.distance_m
  FROM places p
  LEFT JOIN LATERAL (
    SELECT min(ST_Distance(
      ST_SetSRID(ST_MakePoint($1::float8, $2::float8), 4326)::geography,
      ST_GeometryN(p.geometry, n)::geography
    )) AS distance_m
    FROM generate_series(1, ST_NumGeometries(p.geometry)) AS n
  ) d ON true
  WHERE p.geometry IS NOT NULL
  ORDER BY d.distance_m NULLS LAST, p.label
`

export const nearestPlaces = async (
  db: QueryableDb,
  {
    lng,
    lat,
    maxDistanceM,
    level = 'both',
    limit = 5,
  }: {
    lng: number
    lat: number
    maxDistanceM: number
    level?: 'places1' | 'places2' | 'both'
    limit?: number
  },
): Promise<PlaceWithDistanceRow[]> => {
  const levelCondition =
    level === 'places1' ? 'AND parent_id IS NULL'
    : level === 'places2' ? 'AND parent_id IS NOT NULL'
    : ''
  // degree prefilter so the GiST index prunes candidates before the
  // geodesic distance computation; factor 2 covers the longitude shrink
  // of a meters figure up to about 60° latitude
  const maxDistanceDeg = (maxDistanceM / 111_320) * 2
  const res = await db.query(
    `
    SELECT p.place_id, p.label, min(ST_Distance(
      ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography,
      ST_GeometryN(p.geometry, n)::geography
    )) AS distance_m
    FROM places p
    CROSS JOIN generate_series(1, ST_NumGeometries(p.geometry)) AS n
    WHERE p.geometry IS NOT NULL
    ${levelCondition}
      AND p.geometry && ST_Expand(ST_SetSRID(ST_MakePoint($1, $2), 4326), $3)
    GROUP BY p.place_id, p.label
    HAVING min(ST_Distance(
      ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography,
      ST_GeometryN(p.geometry, n)::geography
    )) < $4
    ORDER BY distance_m
    LIMIT $5
    `,
    [lng, lat, maxDistanceDeg, maxDistanceM, limit],
  )
  return (res?.rows ?? []) as PlaceWithDistanceRow[]
}

// SELECT list computing the bounding-box extent of a table's geometry
// column, e.g. extentSelect('p') => "ST_XMin(ST_Extent(p.geometry)) AS x_min, ..."
// (the parameter is the table's alias, not the column: passing the bare
// alias into ST_Extent makes Postgres resolve a whole-row reference and
// fail with "function st_extent(<table>) does not exist")
export const extentSelect = (alias?: string): string =>
  (
    [
      ['ST_XMin', 'x_min'],
      ['ST_YMin', 'y_min'],
      ['ST_XMax', 'x_max'],
      ['ST_YMax', 'y_max'],
    ] as const
  )
    .map(
      ([fn, alias_]) =>
        `${fn}(ST_Extent(${alias ? `${alias}.` : ''}geometry)) AS ${alias_}`,
    )
    .join(', ')

// runs a query built with extentSelect and returns its extent,
// or null if no non-empty geometry matched
export const queryExtent = async (
  db: QueryableDb,
  sql: string,
  params: unknown[] = [],
): Promise<Extent | null> => {
  const res = await db.query(sql, params)
  const row = res?.rows?.[0] as
    | {
        x_min?: number | null
        y_min?: number | null
        x_max?: number | null
        y_max?: number | null
      }
    | undefined
  const { x_min, y_min, x_max, y_max } = row ?? {}
  if (
    [x_min, y_min, x_max, y_max].some(
      (value) => value === null || value === undefined,
    )
  ) {
    return null
  }
  return {
    xMin: x_min!,
    yMin: y_min!,
    xMax: x_max!,
    yMax: y_max!,
  }
}

export const unionExtents = (extents: (Extent | null)[]): Extent | null => {
  const valid = extents.filter((extent): extent is Extent => extent !== null)
  if (!valid.length) return null
  return {
    xMin: Math.min(...valid.map((extent) => extent.xMin)),
    yMin: Math.min(...valid.map((extent) => extent.yMin)),
    xMax: Math.max(...valid.map((extent) => extent.xMax)),
    yMax: Math.max(...valid.map((extent) => extent.yMax)),
  }
}

// from @turf/bbox output [minX, minY, maxX, maxY], for data that never
// touched the database (e.g. freshly fetched WFS features)
export const extentFromBbox = (bbox: number[]): Extent => ({
  xMin: bbox[0],
  yMin: bbox[1],
  xMax: bbox[2],
  yMax: bbox[3],
})

// Leaflet bounds as [[south, west], [north, east]].
// The margin (degrees) replaces the former 0.05 km turf buffer and keeps
// single points from over-zooming; 0.0005° ≈ 55 m
export const extentToBoundsWithMargin = (
  extent: Extent,
  marginDeg = 0.0005,
): [[number, number], [number, number]] => [
  [extent.yMin - marginDeg, extent.xMin - marginDeg],
  [extent.yMax + marginDeg, extent.xMax + marginDeg],
]
