import { getRouteApi } from '@tanstack/react-router'

import { Observations } from '../../../../../../../../../formsAndLists/observations.tsx'

const routeApi = getRouteApi(
  '/data/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/observations/',
)

export const RouteComponent = () => {
  const { projectId, subprojectId, placeId } = routeApi.useParams()

  return (
    <Observations
      projectId={projectId}
      subprojectId={subprojectId}
      placeId={placeId}
    />
  )
}
