import { Outlet, useLocation, useParams } from '@tanstack/react-router'
import { useLiveQuery } from '@electric-sql/pglite-react'

import { SubprojectWithFiles } from '../../../../../../formsAndLists/subproject/WithFiles.tsx'

const from = '/data/projects/$projectId_/subprojects/$subprojectId_'

export const SubprojectLayout = () => {
  const { projectId, subprojectId } = useParams({ strict: false })
  const location = useLocation()
  const res = useLiveQuery(
    `SELECT files_active_subprojects, subproject_files_in_subproject FROM projects WHERE project_id = $1`,
    [projectId],
  )
  const showFiles = res?.rows?.[0]?.files_active_subprojects !== false
  const filesInSubproject =
    res?.rows?.[0]?.subproject_files_in_subproject !== false

  const baseUrl = `/data/projects/${projectId}/subprojects/${subprojectId}`
  const isSubprojectRoute = location.pathname === `${baseUrl}/subproject`
  const isFilesRoute =
    location.pathname === `${baseUrl}/files` ||
    location.pathname.startsWith(`${baseUrl}/files/`)

  if (showFiles && filesInSubproject && (isSubprojectRoute || isFilesRoute)) {
    return <SubprojectWithFiles from={from} />
  }
  return <Outlet />
}
