import { createFileRoute } from '@tanstack/react-router'

import { Observations } from '../../../../../../../../../formsAndLists/observations.tsx'
import { NotFound } from '../../../../../../../../../components/NotFound.tsx'

const RouteComponent = () => {
  const { projectId, subprojectId, placeId } = Route.useParams()
  return (
    <Observations
      projectId={projectId}
      subprojectId={subprojectId}
      placeId={placeId}
    />
  )
}

export const Route = createFileRoute(
  '/data/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/observations/',
)({
  component: RouteComponent,
  notFoundComponent: NotFound,
})
