import { createFileRoute, useParams } from '@tanstack/react-router'

import { Occurrences } from '../../../../../../../../../../formsAndLists/occurrences.tsx'
import { NotFound } from '../../../../../../../../../../components/NotFound.tsx'

export const Route = createFileRoute(
  '/data/_authLayout/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/occurrences/',
)({
  component: RouteComponent,
  notFoundComponent: NotFound,
})

function RouteComponent() {
  const { projectId, subprojectId, placeId } = useParams({
    from: '/data/_authLayout/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/occurrences/',
  })
  return (
    <Occurrences
      projectId={projectId}
      subprojectId={subprojectId}
      placeId={placeId}
    />
  )
}
