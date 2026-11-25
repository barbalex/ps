import { useLiveQuery } from '@electric-sql/pglite-react'
import { useParams } from '@tanstack/react-router'

export const useMapCoordinatesCrs = () => {
  const { projectId } = useParams({ strict: false })
  const result = useLiveQuery<{ code: string; proj4: string | null }>(
    `SELECT p.map_presentation_crs AS code, c.proj4
       FROM projects p LEFT JOIN project_crs c
         ON c.project_id = p.project_id AND c.code = p.map_presentation_crs
      WHERE p.project_id = $1`,
    [projectId ?? null],
  )
  if (!result) return undefined
  const selected = result.rows[0]
  // The map shows longitude/latitude when no project projection is available.
  return selected?.proj4 && selected.code !== 'EPSG:4326' ?
      { code: selected.code, projection: selected.proj4 }
    : { code: 'EPSG:4326', projection: null }
}
