import { createFileRoute } from '@tanstack/react-router'

import { Files } from '../../../../../../../../../../../formsAndLists/files.tsx'
import { NotFound } from '../../../../../../../../../../../components/NotFound.tsx'

const RouteComponent = () => {
  const { projectId, subprojectId, placeId, checkId } = Route.useParams()
  return (
    <Files
      projectId={projectId}
      subprojectId={subprojectId}
      placeId={placeId}
      checkId={checkId}
    />
  )
}

export const Route = createFileRoute(
  '/data/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/checks/$checkId_/files/',
)({
  component: RouteComponent,
  notFoundComponent: NotFound,
})
