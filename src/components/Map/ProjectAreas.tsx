import { useMemo, type ReactNode } from 'react'
import { useLiveQuery } from '@electric-sql/pglite-react'
import { useParams } from '@tanstack/react-router'
import { useAtomValue } from 'jotai'

import {
  ProjectAreasContext,
  type ProjectArea,
} from '../../modules/projectAreas.ts'
import { userIdAtom } from '../../store.ts'

export function ProjectAreas({ children }: { children: ReactNode }) {
  const { projectId } = useParams({ strict: false })
  const userId = useAtomValue(userIdAtom)
  const res = useLiveQuery<ProjectArea>(
    `SELECT p.project_id, bool_or(r.role >= 'design'::user_roles_enum) AS can_design,
       ST_XMin(Box2D(p.geometry)) AS x_min, ST_XMax(Box2D(p.geometry)) AS x_max,
       ST_YMin(Box2D(p.geometry)) AS y_min, ST_YMax(Box2D(p.geometry)) AS y_max
     FROM projects p JOIN project_roles r USING (project_id)
     WHERE p.project_id = $2 AND r.project_user_id IN (SELECT project_user_id FROM user_project_user_ids($1))
     GROUP BY p.project_id`,
    [userId, projectId ?? null],
  )
  const value = useMemo(() => {
    const row = res?.rows[0]
    return { current: row?.project_id === projectId ? row : undefined }
  }, [res, projectId])
  return (
    <ProjectAreasContext.Provider value={value}>
      {children}
    </ProjectAreasContext.Provider>
  )
}
