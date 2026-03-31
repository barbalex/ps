import { getRouteApi, useNavigate } from '@tanstack/react-router'
import { useLiveQuery } from '@electric-sql/pglite-react'

import { Files } from '../../../../../formsAndLists/files.tsx'

const routeApi = getRouteApi('/data/projects/$projectId_/files/')

export const RouteComponent = () => {
  const { projectId } = routeApi.useParams()
  const navigate = useNavigate()

  const projectRes = useLiveQuery(
    `SELECT files_active_projects, project_files_in_project FROM projects WHERE project_id = $1`,
    [projectId],
  )
  const showFiles = projectRes?.rows?.[0]?.files_active_projects !== false
  const filesInProject = projectRes?.rows?.[0]?.project_files_in_project === true

  if (projectRes && !showFiles) {
    navigate({ to: `/data/projects/${projectId}/project` })
    return null
  }

  if (projectRes === undefined) return null

  return <Files projectId={projectId} hideTitle={filesInProject} />
}
