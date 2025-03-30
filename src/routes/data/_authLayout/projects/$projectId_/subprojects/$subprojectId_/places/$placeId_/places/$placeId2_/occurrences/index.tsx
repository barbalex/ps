import { createFileRoute, useParams } from '@tanstack/react-router'

import { Occurrences } from '../../../../../../../../../../../../formsAndLists/occurrences.tsx'
import { NotFound } from '../../../../../../../../../../../../components/NotFound.tsx'

export const Route = createFileRoute(
  '/data/_authLayout/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/places/$placeId2_/occurrences/',
)({
  component: RouteComponent,
  notFoundComponent: NotFound,
})

function RouteComponent() {
  const { projectId, subprojectId, placeId, placeId2 } = useParams({
    from: '/data/_authLayout/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/places/$placeId2_/occurrences/',
  })

  return (
    <Occurrences
      projectId={projectId}
      subprojectId={subprojectId}
      placeId={placeId}
      placeId2={placeId2}
    />
  )
}
