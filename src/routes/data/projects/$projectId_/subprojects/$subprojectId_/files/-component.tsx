import { getRouteApi } from '@tanstack/react-router'
import { useLiveQuery } from '@electric-sql/pglite-react'

import { Files } from '../../../../../../../formsAndLists/files.tsx'

const routeApi = getRouteApi(
  '/data/projects/$projectId_/subprojects/$subprojectId_/files/',
)

export const RouteComponent = () => {
  const { projectId, subprojectId } = routeApi.useParams()

  const projectRes = useLiveQuery(
    `SELECT subproject_files_in_subproject FROM projects WHERE project_id = $1`,
    [projectId],
  )
  const filesInSubproject =
    projectRes?.rows?.[0]?.subproject_files_in_subproject !== false

  return (
    <Files
      projectId={projectId}
      subprojectId={subprojectId}
      hideTitle={filesInSubproject}
    />
  )
}
