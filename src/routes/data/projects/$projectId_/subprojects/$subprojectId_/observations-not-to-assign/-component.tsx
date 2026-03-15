import { getRouteApi } from '@tanstack/react-router'

import { Observations } from '../../../../../../../formsAndLists/observations.tsx'

const routeApi = getRouteApi(
  '/data/projects/$projectId_/subprojects/$subprojectId_/observations-not-to-assign/',
)

export const RouteComponent = () => {
  const { projectId, subprojectId } = routeApi.useParams()
  return (
    <Observations
      isNotToAssign={true}
      projectId={projectId}
      subprojectId={subprojectId}
    />
  )
}
