import { getRouteApi } from '@tanstack/react-router'

import { Files } from '../../../../../../../formsAndLists/files.tsx'

const routeApi = getRouteApi(
  '/data/projects/$projectId_/subprojects/$subprojectId_/files/',
)

export const RouteComponent = () => {
  const { projectId, subprojectId } = routeApi.useParams()
  return <Files projectId={projectId} subprojectId={subprojectId} />
}
