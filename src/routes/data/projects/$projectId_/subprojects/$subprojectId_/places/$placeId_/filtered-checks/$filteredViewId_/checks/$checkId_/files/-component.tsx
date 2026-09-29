import { getRouteApi } from '@tanstack/react-router'

import { Files } from '../../../../../../../../../../../../../formsAndLists/files.tsx'

const routeApi = getRouteApi(
  '/data/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/filtered-checks/$filteredViewId_/checks/$checkId_/files/',
)

export const RouteComponent = () => {
  const { projectId, subprojectId, placeId, filteredViewId, checkId } = routeApi.useParams()

  return (
    <Files
      projectId={projectId}
      subprojectId={subprojectId}
      placeId={placeId}
      checkId={checkId}
      filteredViewId={filteredViewId}
      hideTitle={true}
    />
  )
}
