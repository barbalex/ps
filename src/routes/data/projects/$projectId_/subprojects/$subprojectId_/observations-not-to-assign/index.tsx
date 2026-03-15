import { createFileRoute } from '@tanstack/react-router'

import { Observations } from '../../../../../../../formsAndLists/observations.tsx'
import { NotFound } from '../../../../../../../components/NotFound.tsx'

const RouteComponent = () => {
  const { projectId, subprojectId } = Route.useParams()
  return (
    <Observations
      isNotToAssign={true}
      projectId={projectId}
      subprojectId={subprojectId}
    />
  )
}

export const Route = createFileRoute(
  '/data/projects/$projectId_/subprojects/$subprojectId_/observations-not-to-assign/',
)({
  component: RouteComponent,
  notFoundComponent: NotFound,
})
