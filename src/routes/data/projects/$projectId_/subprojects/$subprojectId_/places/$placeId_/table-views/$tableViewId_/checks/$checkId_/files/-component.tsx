import { getRouteApi } from '@tanstack/react-router'

import { Files } from '../../../../../../../../../../../../../formsAndLists/files.tsx'

const routeApi = getRouteApi(
  '/data/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/table-views/$tableViewId_/checks/$checkId_/files/',
)

export const RouteComponent = () => {
  const { projectId, subprojectId, placeId, tableViewId, checkId } = routeApi.useParams()

  return (
    <Files
      projectId={projectId}
      subprojectId={subprojectId}
      placeId={placeId}
      checkId={checkId}
      tableViewId={tableViewId}
      hideTitle={true}
    />
  )
}
