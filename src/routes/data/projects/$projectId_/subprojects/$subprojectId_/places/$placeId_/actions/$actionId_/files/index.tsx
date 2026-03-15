import { createFileRoute } from '@tanstack/react-router'

import { Files } from '../../../../../../../../../../../formsAndLists/files.tsx'
import { NotFound } from '../../../../../../../../../../../components/NotFound.tsx'

const RouteComponent = () => {
  const { projectId, subprojectId, placeId, actionId } = Route.useParams()
  return (
    <Files
      projectId={projectId}
      subprojectId={subprojectId}
      placeId={placeId}
      actionId={actionId}
    />
  )
}

export const Route = createFileRoute(
  '/data/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/actions/$actionId_/files/',
)({
  component: RouteComponent,
  notFoundComponent: NotFound,
})
