import { getRouteApi } from '@tanstack/react-router'

import { Files } from '../../../../../../../../../../../formsAndLists/files.tsx'

const routeApi = getRouteApi(
  '/data/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/actions/$actionId_/files/',
)

export const RouteComponent = () => {
  const { projectId, subprojectId, placeId, actionId } = routeApi.useParams()

  return (
    <Files
      projectId={projectId}
      subprojectId={subprojectId}
      placeId={placeId}
      actionId={actionId}
      hideTitle={true}
    />
  )
}
