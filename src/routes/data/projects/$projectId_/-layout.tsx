import { Outlet, useLocation, useParams } from '@tanstack/react-router'
import { useLiveQuery } from '@electric-sql/pglite-react'
import { useAtom } from 'jotai'

import { ProjectWithFiles } from '../../../../formsAndLists/project/WithFiles.tsx'
import { designingAtom } from '../../../../store.ts'

const from = '/data/projects/$projectId_'

export const ProjectLayout = () => {
  const { projectId } = useParams({ strict: false })
  const [isDesigning] = useAtom(designingAtom)
  const location = useLocation()
  const res = useLiveQuery(
    `SELECT files_active_projects, project_users_in_project, project_files_in_project, units_in_project FROM projects WHERE project_id = $1`,
    [projectId],
  )

  const showFiles = res?.rows?.[0]?.files_active_projects !== false
  const usersInProject = res?.rows?.[0]?.project_users_in_project !== false
  const filesInProject = res?.rows?.[0]?.project_files_in_project === true
  const unitsInProject = res?.rows?.[0]?.units_in_project !== false

  const baseUrl = `/data/projects/${projectId}`
  const isProjectRoute = location.pathname === `${baseUrl}/project`
  const isUsersRoute =
    location.pathname === `${baseUrl}/users` ||
    location.pathname.startsWith(`${baseUrl}/users/`)
  const isUnitsRoute =
    location.pathname === `${baseUrl}/units` ||
    location.pathname.startsWith(`${baseUrl}/units/`)
  const isFilesRoute =
    location.pathname === `${baseUrl}/files` ||
    location.pathname.startsWith(`${baseUrl}/files/`)

  if (
    (isProjectRoute &&
      ((isDesigning && usersInProject) ||
        (isDesigning && unitsInProject) ||
        (showFiles && filesInProject))) ||
    (isUsersRoute && isDesigning && usersInProject) ||
    (isUnitsRoute && isDesigning && unitsInProject) ||
    (isFilesRoute && showFiles && filesInProject)
  ) {
    return <ProjectWithFiles from={from} />
  }
  return <Outlet />
}
