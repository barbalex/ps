import { Outlet, useLocation, useParams } from '@tanstack/react-router'
import { useLiveQuery } from '@electric-sql/pglite-react'

import { ProjectWithFiles } from '../../../../formsAndLists/project/WithFiles.tsx'

const from = '/data/projects/$projectId_'

export const ProjectLayout = () => {
  const { projectId } = useParams({ strict: false })
  const location = useLocation()
  const res = useLiveQuery(
    `SELECT files_active_projects, project_files_in_project FROM projects WHERE project_id = $1`,
    [projectId],
  )

  const showFiles = res?.rows?.[0]?.files_active_projects !== false
  const filesInProject = res?.rows?.[0]?.project_files_in_project !== false

  const baseUrl = `/data/projects/${projectId}`
  const isProjectRoute = location.pathname === `${baseUrl}/project`
  const isFilesRoute =
    location.pathname === `${baseUrl}/files` ||
    location.pathname.startsWith(`${baseUrl}/files/`)

  if (showFiles && filesInProject && (isProjectRoute || isFilesRoute)) {
    return <ProjectWithFiles from={from} />
  }
  return <Outlet />
}
