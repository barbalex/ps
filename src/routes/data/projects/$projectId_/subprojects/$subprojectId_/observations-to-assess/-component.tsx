import { getRouteApi } from '@tanstack/react-router'

import { Observations } from '../../../../../../../formsAndLists/observations.tsx'

const routeApi = getRouteApi(
  '/data/projects/$projectId_/subprojects/$subprojectId_/observations-to-assess/',
)

export const RouteComponent = () => {
  const { projectId, subprojectId } = routeApi.useParams()
  return (
    <Observations
      isToAssess={true}
      projectId={projectId}
      subprojectId={subprojectId}
    />
  )
}
