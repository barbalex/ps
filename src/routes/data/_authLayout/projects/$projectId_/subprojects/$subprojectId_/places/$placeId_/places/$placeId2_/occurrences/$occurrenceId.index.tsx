import { createFileRoute } from '@tanstack/react-router'

import { Occurrence } from '../../../../../../../../../../../../formsAndLists/occurrence/index.tsx'

export const Route = createFileRoute(
  '/data/_authLayout/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/places/$placeId2_/occurrences/$occurrenceId/',
)({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <Occurrence from="/data/_authLayout/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/places/$placeId2_/occurrences/$occurrenceId/" />
  )
}
