import { useLiveQuery } from '@electric-sql/pglite-react'
import { useParams } from '@tanstack/react-router'
import { useAtomValue } from 'jotai'

import { personalMapCrsAtom, userIdAtom } from '../store.ts'
import { useUrlDesigning } from './useUrlDesigning.ts'

const wgs84 = { code: 'EPSG:4326', name: 'WGS84', projection: null }

export const useMapCoordinatesCrs = () => {
  const { projectId } = useParams({ strict: false })
  const userId = useAtomValue(userIdAtom)
  const personal = useAtomValue(personalMapCrsAtom)
  const [designing] = useUrlDesigning(projectId)
  const key = projectId && userId ? `${userId}:${projectId}` : undefined
  const result = useLiveQuery<{
    map_presentation_crs: string | null
    may_design: boolean
    code: string | null
    name: string | null
    proj4: string | null
  }>(
    `SELECT p.map_presentation_crs, c.code, c.name, c.proj4,
       EXISTS (SELECT 1 FROM project_roles pr JOIN project_users pu USING (project_user_id)
               WHERE pr.project_id = p.project_id AND pr.role IN ('design', 'own')
                 AND (pu.auth_user_id = $2 OR pu.email = (SELECT email FROM users WHERE user_id = $2))) AS may_design
     FROM projects p LEFT JOIN project_crs c ON c.project_id = p.project_id
     WHERE p.project_id = $1 ORDER BY c.code, c.project_crs_id`,
    [projectId ?? null, userId],
  )
  if (!result) return undefined
  const options = new Map<
    string,
    { code: string; name: string | null; projection: string | null }
  >()
  options.set(wgs84.code, wgs84)
  for (const { code, name, proj4 } of result.rows) {
    if (code && proj4 && !options.has(code))
      options.set(code, { code, name, projection: proj4 })
  }
  const project = result.rows[0]
  const shared = designing && !!project?.may_design
  const active =
    (!shared && key && options.get(personal[key])) ||
    options.get(project?.map_presentation_crs ?? '') ||
    wgs84
  return { ...active, options, shared, key, projectId }
}
