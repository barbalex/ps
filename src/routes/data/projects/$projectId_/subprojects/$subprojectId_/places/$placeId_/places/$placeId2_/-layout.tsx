import { Outlet, useLocation, useParams } from '@tanstack/react-router'
import { useLiveQuery } from '@electric-sql/pglite-react'

import { PlaceWithFiles } from '../../../../../../../../../../formsAndLists/place/WithFiles.tsx'

const from =
  '/data/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/places/$placeId2_'

export const PlaceLayout = () => {
  const { projectId, subprojectId, placeId, placeId2 } = useParams({
    strict: false,
  })
  const location = useLocation()
  const res = useLiveQuery(
    `SELECT place_files, place_files_in_place FROM place_levels WHERE project_id = $1 AND level = 2`,
    [projectId],
  )
  const showFiles = res?.rows?.[0]?.place_files !== false
  const filesInPlace = res?.rows?.[0]?.place_files_in_place !== false

  const baseUrl = `/data/projects/${projectId}/subprojects/${subprojectId}/places/${placeId}/places/${placeId2}`
  const isPlaceRoute = location.pathname === `${baseUrl}/place`
  const isFilesRoute =
    location.pathname === `${baseUrl}/files` ||
    location.pathname.startsWith(`${baseUrl}/files/`)

  if (showFiles && filesInPlace && (isPlaceRoute || isFilesRoute)) {
    return <PlaceWithFiles from={from} />
  }
  return <Outlet />
}
