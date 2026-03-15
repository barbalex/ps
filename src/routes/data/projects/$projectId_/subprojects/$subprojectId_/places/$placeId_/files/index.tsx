import { createFileRoute } from '@tanstack/react-router'

import { Files } from '../../../../../../../../../formsAndLists/files.tsx'
import { NotFound } from '../../../../../../../../../components/NotFound.tsx'

const RouteComponent = () => {
  const { projectId, subprojectId, placeId } = Route.useParams()
  return (
    <Files
      projectId={projectId}
      subprojectId={subprojectId}
      placeId={placeId}
    />
  )
}

export const Route = createFileRoute(
  '/data/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/files/',
)({
  component: RouteComponent,
  notFoundComponent: NotFound,
})
