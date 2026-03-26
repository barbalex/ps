import { getRouteApi } from '@tanstack/react-router'
import { useLiveQuery } from '@electric-sql/pglite-react'

import { Files } from '../../../../../../../../../../../formsAndLists/files.tsx'

const routeApi = getRouteApi(
  '/data/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/actions/$actionId_/files/',
)

export const RouteComponent = () => {
  const { projectId, subprojectId, placeId, actionId } = routeApi.useParams()

  const placeLevelRes = useLiveQuery(
    `SELECT files_in_action FROM place_levels WHERE project_id = $1 AND level = 1`,
    [projectId],
  )
  const filesInAction = placeLevelRes?.rows?.[0]?.files_in_action !== false

  return (
    <Files
      projectId={projectId}
      subprojectId={subprojectId}
      placeId={placeId}
      actionId={actionId}
      hideTitle={filesInAction}
    />
  )
}
