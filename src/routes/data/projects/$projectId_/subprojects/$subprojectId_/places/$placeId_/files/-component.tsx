import { getRouteApi } from '@tanstack/react-router'
import { useLiveQuery } from '@electric-sql/pglite-react'

import { Files } from '../../../../../../../../../formsAndLists/files.tsx'

const routeApi = getRouteApi(
  '/data/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/files/',
)

export const RouteComponent = () => {
  const { projectId, subprojectId, placeId } = routeApi.useParams()

  const placeLevelRes = useLiveQuery(
    `SELECT place_files_in_place FROM place_levels WHERE project_id = $1 AND level = 1`,
    [projectId],
  )
  const placeFilesInPlace =
    placeLevelRes?.rows?.[0]?.place_files_in_place !== false

  return (
    <Files
      projectId={projectId}
      subprojectId={subprojectId}
      placeId={placeId}
      hideTitle={placeFilesInPlace}
    />
  )
}
