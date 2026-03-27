import { getRouteApi } from '@tanstack/react-router'
import { useLiveQuery } from '@electric-sql/pglite-react'

import { Files } from '../../../../../../../../../../../../../formsAndLists/files.tsx'

const routeApi = getRouteApi(
  '/data/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/places/$placeId2_/actions/$actionId_/files/',
)

export const RouteComponent = () => {
  const { projectId, subprojectId, placeId, placeId2, actionId } =
    routeApi.useParams()

  const placeLevelRes = useLiveQuery(
    `SELECT action_files_in_action FROM place_levels WHERE project_id = $1 AND level = 2`,
    [projectId],
  )
  const filesInAction = placeLevelRes?.rows?.[0]?.action_files_in_action !== false

  return (
    <Files
      projectId={projectId}
      subprojectId={subprojectId}
      placeId={placeId}
      placeId2={placeId2}
      actionId={actionId}
      hideTitle={filesInAction}
    />
  )
}
