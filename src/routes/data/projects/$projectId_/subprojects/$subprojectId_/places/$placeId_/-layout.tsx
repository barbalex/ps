import { Outlet, useLocation, useParams } from '@tanstack/react-router'
import { useLiveQuery } from '@electric-sql/pglite-react'

import { PlaceWithFiles } from '../../../../../../../../formsAndLists/place/WithFiles.tsx'

const from =
  '/data/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_'

export const PlaceLayout = () => {
  const { projectId, subprojectId, placeId } = useParams({ strict: false })
  const location = useLocation()
  const res = useLiveQuery(
    `SELECT place_users_in_place, place_files, place_files_in_place FROM place_levels WHERE project_id = $1 AND level = 1`,
    [projectId],
  )
  const usersInPlace = res?.rows?.[0]?.place_users_in_place !== false
  const showFiles = res?.rows?.[0]?.place_files !== false
  const filesInPlace = res?.rows?.[0]?.place_files_in_place !== false

  const baseUrl = `/data/projects/${projectId}/subprojects/${subprojectId}/places/${placeId}`
  const isPlaceRoute = location.pathname === `${baseUrl}/place`
  const isUsersRoute =
    location.pathname === `${baseUrl}/users` ||
    location.pathname.startsWith(`${baseUrl}/users/`)
  const isFilesRoute =
    location.pathname === `${baseUrl}/files` ||
    location.pathname.startsWith(`${baseUrl}/files/`)

  if (
    (isPlaceRoute && (usersInPlace || (showFiles && filesInPlace))) ||
    (isUsersRoute && usersInPlace) ||
    (isFilesRoute && showFiles && filesInPlace)
  ) {
    return <PlaceWithFiles from={from} />
  }
  return <Outlet />
}
