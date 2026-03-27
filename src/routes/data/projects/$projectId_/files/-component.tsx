import { getRouteApi } from '@tanstack/react-router'
import { useLiveQuery } from '@electric-sql/pglite-react'

import { Files } from '../../../../../formsAndLists/files.tsx'

const routeApi = getRouteApi('/data/projects/$projectId_/files/')

export const RouteComponent = () => {
  const { projectId } = routeApi.useParams()

  const projectRes = useLiveQuery(
    `SELECT project_files_in_project FROM projects WHERE project_id = $1`,
    [projectId],
  )
  const filesInProject = projectRes?.rows?.[0]?.project_files_in_project !== false

  return <Files projectId={projectId} hideTitle={filesInProject} />
}
