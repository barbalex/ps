import type { QueryableDb } from './geoQueries.ts'

export type PolygonAction = 'hole' | 'reshape' | 'split'
export type PolygonTarget = {
  index: number
  part: number
  polygon: GeoJSON.Polygon
}
export type PolygonResult = {
  shapes: GeoJSON.Polygon[]
  removed: GeoJSON.LineString | null
}

export const polygonTargets = (members: GeoJSON.Geometry[]): PolygonTarget[] =>
  members.flatMap((g, index) =>
    g.type === 'Polygon' ? [{ index, part: 0, polygon: g }]
    : g.type === 'MultiPolygon' ?
      g.coordinates.map((coordinates, part) => ({
        index,
        part,
        polygon: { type: 'Polygon' as const, coordinates },
      }))
    : [],
  )

export const replacePolygon = (
  members: GeoJSON.Geometry[],
  target: PolygonTarget,
  shapes: (GeoJSON.Polygon | GeoJSON.LineString)[],
) =>
  members.flatMap((g, index): GeoJSON.Geometry[] =>
    index !== target.index ? [g]
    : g.type === 'MultiPolygon' ?
      g.coordinates.flatMap((coordinates, part): GeoJSON.Geometry[] =>
        part === target.part ? shapes : [{ type: 'Polygon', coordinates }],
      )
    : shapes,
  )

const input = `WITH input AS (SELECT ST_GeomFromGeoJSON($1) AS p, ST_GeomFromGeoJSON($2) AS t),
  valid AS (SELECT * FROM input WHERE ST_IsValid(p) AND ST_IsValid(t) AND ST_IsSimple(t))`
const operations = {
  hole: `SELECT ST_Difference(p,t) AS g, NULL::geometry AS removed FROM valid
    WHERE ST_ContainsProperly(p,t)`,
  split: `SELECT (ST_Dump(pieces)).geom AS g, NULL::geometry AS removed FROM
    (SELECT ST_Split(p,t) AS pieces FROM valid WHERE NOT ST_IsClosed(t)
       AND ST_NumGeometries(ST_CollectionExtract(ST_Intersection(t,ST_ExteriorRing(p)),1)) >= 2
    ) s WHERE ST_NumGeometries(pieces) > 1`,
  reshape: `SELECT result AS g, removed FROM (
    WITH shell AS (SELECT *, ST_ExteriorRing(p) AS r FROM valid),
    ends AS (SELECT *, ST_LineLocatePoint(r,ST_StartPoint(t)) AS a, ST_LineLocatePoint(r,ST_EndPoint(t)) AS b
      FROM shell WHERE ST_DWithin(ST_StartPoint(t)::geography,r::geography,5)
        AND ST_DWithin(ST_EndPoint(t)::geography,r::geography,5)),
    arcs AS (SELECT *, ST_LineSubstring(r,least(a,b),greatest(a,b)) AS direct,
      ST_RemoveRepeatedPoints(ST_MakeLine(ST_LineSubstring(r,greatest(a,b),1),ST_LineSubstring(r,0,least(a,b)))) AS wrap,
      CASE WHEN a<b THEN t ELSE ST_Reverse(t) END AS forward FROM ends WHERE a<>b),
    joins AS (SELECT *, ST_SetPoint(ST_SetPoint(forward,0,ST_StartPoint(direct)),-1,ST_EndPoint(direct)) AS path,
      (ST_Length(direct::geography)<=ST_Length(wrap::geography)) <> $3::boolean AS short_direct FROM arcs),
    rings AS (SELECT *, CASE WHEN short_direct THEN direct ELSE wrap END AS removed,
      CASE WHEN short_direct THEN wrap ELSE direct END AS kept FROM joins),
    outline AS (SELECT *, ST_RemoveRepeatedPoints(CASE WHEN short_direct THEN ST_MakeLine(path,kept)
      ELSE ST_MakeLine(kept,ST_Reverse(path)) END) AS newring FROM rings
      WHERE ST_IsSimple(path) AND NOT ST_IsClosed(path)
        AND ST_Relate(path,r,'F********')),
    rebuilt AS (SELECT p, removed, ST_MakePolygon(newring,ARRAY(SELECT ST_InteriorRingN(p,i)
      FROM generate_series(1,ST_NumInteriorRings(p)) i)) AS result FROM outline
      WHERE ST_IsRing(newring) AND ST_NPoints(newring)>=4)
    SELECT * FROM rebuilt WHERE ST_IsValid(result) AND NOT ST_Equals(p,result)) final`,
}

export const previewPolygonEdit = async (
  db: QueryableDb,
  action: PolygonAction,
  polygon: GeoJSON.Polygon,
  track: GeoJSON.LineString | GeoJSON.Polygon,
  otherArc = false,
): Promise<PolygonResult | null> => {
  const args: (string | boolean)[] = [
    JSON.stringify(polygon),
    JSON.stringify(track),
  ]
  if (action === 'reshape') args.push(otherArc)
  const { rows } = await db.query<{
    shape: GeoJSON.Polygon
    removed: GeoJSON.LineString | null
    valid: boolean
  }>(
    `${input}, result AS (${operations[action]})
     SELECT ST_AsGeoJSON(g,17)::json AS shape, ST_AsGeoJSON(removed,17)::json AS removed,
       ST_GeometryType(g)='ST_Polygon' AND NOT ST_IsEmpty(g) AND ST_IsValid(g) AS valid FROM result`,
    args,
  )
  return rows.length && rows.every((row) => row.valid) ?
      { shapes: rows.map((row) => row.shape), removed: rows[0].removed }
    : null
}
