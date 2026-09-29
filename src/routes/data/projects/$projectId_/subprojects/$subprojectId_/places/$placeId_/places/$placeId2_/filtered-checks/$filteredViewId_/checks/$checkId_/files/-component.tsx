import { getRouteApi } from '@tanstack/react-router'

import { Files } from '../../../../../../../../../../../../../../../formsAndLists/files.tsx'

const routeApi = getRouteApi(
  '/data/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/places/$placeId2_/filtered-checks/$filteredViewId_/checks/$checkId_/files/',
)

export const RouteComponent = () => {
  const { projectId, subprojectId, placeId, placeId2, filteredViewId, checkId } =
    routeApi.useParams()

  return (
    <Files
      projectId={projectId}
      subprojectId={subprojectId}
      placeId={placeId}
      placeId2={placeId2}
      checkId={checkId}
      filteredViewId={filteredViewId}
      hideTitle={true}
    />
  )
}
