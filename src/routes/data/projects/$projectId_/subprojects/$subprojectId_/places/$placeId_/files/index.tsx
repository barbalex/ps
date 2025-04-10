import { createFileRoute, useParams } from '@tanstack/react-router'

import { Files } from '../../../../../../../../../formsAndLists/files.tsx'
import { NotFound } from '../../../../../../../../../components/NotFound.tsx'

export const Route = createFileRoute(
  '/data/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/files/',
)({
  component: RouteComponent,
  notFoundComponent: NotFound,
})

function RouteComponent() {
  const { projectId, subprojectId, placeId } = useParams({
    from: '/data/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/files/',
  })

  return (
    <Files
      projectId={projectId}
      subprojectId={subprojectId}
      placeId={placeId}
    />
  )
}
