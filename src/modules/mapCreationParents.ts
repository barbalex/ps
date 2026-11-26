import type { MapCreation } from './mapCreation.ts'
import { roleDependencies } from './writeAccess.ts'

type Target = Pick<MapCreation, 'table' | 'level'>
type Route = {
  subprojectId?: string
  placeId?: string
  placeId2?: string
}

export type CreationParent = {
  id: string
  subproject_id: string
  place_id: string | null
  label: string
}

export const mapCreationTarget = (layer: {
  layer_type: string
  type?: string | null
  own_table?: string | null
  own_table_level?: number | null
}): Target | null => {
  const level = layer.own_table_level
  if (
    layer.layer_type !== 'vector' ||
    layer.type !== 'own' ||
    (level !== 1 && level !== 2)
  )
    return null
  switch (layer.own_table) {
    case 'places':
      return { table: 'place', level }
    case 'checks':
      return { table: 'check', level }
    case 'actions':
      return { table: 'action', level }
    default:
      return null
  }
}

export const parentQuery = (
  target: Target,
  route: Route,
  projectId: string,
  userId: string | null,
  picker = false,
) => {
  const subprojectParent = target.table === 'place' && target.level === 1
  const childPlaceParent = target.table !== 'place' && target.level === 2
  const preferredId =
    subprojectParent ? route.subprojectId
    : childPlaceParent ? route.placeId2
    : route.placeId
  const params = [projectId, userId, route.subprojectId ?? null]
  const subprojectLabel = `coalesce(nullif(s.label,''), nullif(s.name,''), s.subproject_id::text)`
  const scope = `s.project_id = $1 AND ($3::uuid IS NULL OR s.subproject_id = $3)`
  let candidates: string
  if (subprojectParent) {
    candidates = `SELECT s.subproject_id AS id, s.subproject_id, null::uuid AS place_id,
        ${subprojectLabel} AS label
      FROM subprojects s WHERE ${scope} AND user_can_write_subproject(s.subproject_id, $2)`
  } else {
    if (childPlaceParent) params.push(route.placeId ?? null)
    candidates = `SELECT p.place_id AS id, s.subproject_id, p.place_id,
        concat_ws(' / ', ${subprojectLabel},
          ${childPlaceParent ? `coalesce(nullif(parent.label,''), nullif(parent.name,''), parent.place_id::text),` : ''}
          coalesce(nullif(p.label,''), nullif(p.name,''), p.place_id::text)) AS label
      FROM subprojects s JOIN places p ON p.subproject_id = s.subproject_id
      ${childPlaceParent ? 'JOIN places parent ON parent.place_id = p.parent_id' : ''}
      WHERE ${scope} AND ${childPlaceParent ? '($4::uuid IS NULL OR p.parent_id = $4)' : 'p.parent_id IS NULL'}
        AND ${
          target.table === 'place' ?
            'user_can_write_subproject(s.subproject_id, $2)'
          : 'user_can_write_place(p.place_id, $2)'
        }`
  }
  const cte = `WITH ${roleDependencies}, candidates AS NOT MATERIALIZED (${candidates})`
  if (picker) {
    return {
      preferredId,
      params,
      sql: `${cte} SELECT id, subproject_id, place_id,
        CASE WHEN count(*) OVER (PARTITION BY label) > 1 THEN label || ' · ' || id::text
             ELSE label END AS label FROM candidates ORDER BY label, id`,
    }
  }
  params.push(preferredId ?? null)
  // Don't materialize every option for each closed layer row. Prefer the
  // applicable route parent; otherwise one eligible row suffices to show +.
  return {
    preferredId,
    params,
    sql: `${cte}, preferred AS (SELECT * FROM candidates WHERE id = $${params.length})
      SELECT * FROM preferred UNION ALL
      (SELECT * FROM candidates WHERE NOT EXISTS (SELECT 1 FROM preferred) LIMIT 1)`,
  }
}
