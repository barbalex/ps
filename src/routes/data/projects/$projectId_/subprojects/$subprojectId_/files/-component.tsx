import { useEffect } from 'react'
import { getRouteApi, useNavigate } from '@tanstack/react-router'
import { useLiveQuery } from '@electric-sql/pglite-react'

import { Files } from '../../../../../../../formsAndLists/files.tsx'

const routeApi = getRouteApi(
  '/data/projects/$projectId_/subprojects/$subprojectId_/files/',
)

export const RouteComponent = () => {
  const { projectId, subprojectId } = routeApi.useParams()
  const navigate = useNavigate()

  const projectRes = useLiveQuery(
    `SELECT files_active_subprojects, subproject_files_in_subproject FROM projects WHERE project_id = $1`,
    [projectId],
  )
  const showFiles = projectRes?.rows?.[0]?.files_active_subprojects !== false
  const filesInSubproject =
    projectRes?.rows?.[0]?.subproject_files_in_subproject !== false

  useEffect(() => {
    if (projectRes && !showFiles) {
      navigate({ to: `/data/projects/${projectId}/subprojects/${subprojectId}/subproject` })
    }
  }, [navigate, projectId, projectRes, showFiles, subprojectId])

  if (projectRes === undefined || !showFiles) return null

  return (
    <Files
      projectId={projectId}
      subprojectId={subprojectId}
      hideTitle={filesInSubproject}
    />
  )
}
