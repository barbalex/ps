import { getRouteApi } from '@tanstack/react-router'

import { Observations } from '../../../../../../../../../../../formsAndLists/observations.tsx'

const routeApi = getRouteApi(
  '/data/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/places/$placeId2_/observations/',
)

export const RouteComponent = () => {
  const { projectId, subprojectId, placeId, placeId2 } = routeApi.useParams()

  return (
    <Observations
      projectId={projectId}
      subprojectId={subprojectId}
      placeId={placeId}
      placeId2={placeId2}
    />
  )
}
