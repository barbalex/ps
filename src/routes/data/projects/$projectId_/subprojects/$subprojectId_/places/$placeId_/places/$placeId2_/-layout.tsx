import { useMapInfoForm } from '../../../../../../../../../../modules/mapInfoFormContext.ts'
import { Outlet, useLocation, useParams } from '@tanstack/react-router'
import { useNavRollups } from '../../../../../../../../../../modules/navRollupsContext.ts'

import { PlaceWithFiles } from '../../../../../../../../../../formsAndLists/place/WithFiles.tsx'

const from =
  '/data/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/places/$placeId2_'

export const PlaceLayout = () => {
  const { projectId, subprojectId, placeId, placeId2 } = useParams({
    strict: false,
  })
  const location = useLocation()
  const level = useNavRollups().placeLevel(projectId!, 2)
  const usersInPlace = level?.place_roles_in_place !== false
  const showFiles = level?.place_files !== false
  const filesInPlace = level?.place_files_in_place !== false

  const baseUrl = `/data/projects/${projectId}/subprojects/${subprojectId}/places/${placeId}/places/${placeId2}`
  const mapChildren = useMapInfoForm(baseUrl)
  const isPlaceRoute = location.pathname === `${baseUrl}/place`
  const isUsersRoute =
    location.pathname === `${baseUrl}/users` ||
    location.pathname.startsWith(`${baseUrl}/users/`)
  const isFilesRoute =
    location.pathname === `${baseUrl}/files` ||
    location.pathname.startsWith(`${baseUrl}/files/`)

  if (mapChildren && !location.pathname.startsWith(`${baseUrl}/histories/`)) {
    return <PlaceWithFiles from={from} mapChildren />
  }

  if (
    (isPlaceRoute && (usersInPlace || (showFiles && filesInPlace))) ||
    (isUsersRoute && usersInPlace) ||
    (isFilesRoute && showFiles && filesInPlace)
  ) {
    return <PlaceWithFiles from={from} />
  }
  return <Outlet />
}
