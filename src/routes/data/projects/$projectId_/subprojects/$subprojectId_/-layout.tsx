import { Outlet, useLocation, useParams } from '@tanstack/react-router'
import { useLiveQuery } from '@electric-sql/pglite-react'

import { SubprojectWithFiles } from '../../../../../../formsAndLists/subproject/WithFiles.tsx'

const from = '/data/projects/$projectId_/subprojects/$subprojectId_'

export const SubprojectLayout = () => {
  const { projectId, subprojectId } = useParams({ strict: false })
  const location = useLocation()
  const res = useLiveQuery(
    `SELECT taxa, files_active_subprojects, subproject_taxa_in_subproject, subproject_users_in_subproject, subproject_files_in_subproject FROM projects WHERE project_id = $1`,
    [projectId],
  )
  const showTaxa = res?.rows?.[0]?.taxa !== false
  const taxaInSubproject =
    res?.rows?.[0]?.subproject_taxa_in_subproject !== false
  const showFiles = res?.rows?.[0]?.files_active_subprojects !== false
  const usersInSubproject =
    res?.rows?.[0]?.subproject_users_in_subproject !== false
  const filesInSubproject =
    res?.rows?.[0]?.subproject_files_in_subproject !== false

  const baseUrl = `/data/projects/${projectId}/subprojects/${subprojectId}`
  const isSubprojectRoute = location.pathname === `${baseUrl}/subproject`
  const isUsersRoute =
    location.pathname === `${baseUrl}/users` ||
    location.pathname.startsWith(`${baseUrl}/users/`)
  const isTaxaRoute =
    location.pathname === `${baseUrl}/taxa` ||
    location.pathname.startsWith(`${baseUrl}/taxa/`)
  const isFilesRoute =
    location.pathname === `${baseUrl}/files` ||
    location.pathname.startsWith(`${baseUrl}/files/`)

  if (
    (isSubprojectRoute &&
      ((showTaxa && taxaInSubproject) ||
        usersInSubproject ||
        (showFiles && filesInSubproject))) ||
    (isTaxaRoute && showTaxa && taxaInSubproject) ||
    (isUsersRoute && usersInSubproject) ||
    (isFilesRoute && showFiles && filesInSubproject)
  ) {
    return <SubprojectWithFiles from={from} />
  }
  return <Outlet />
}
