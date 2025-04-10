import { createFileRoute } from '@tanstack/react-router'

import { Occurrence } from '../../../../../../../../../formsAndLists/occurrence/index.tsx'

export const Route = createFileRoute(
  '/data/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/occurrences/$occurrenceId/',
)({
  component: RouteComponent,
  beforeLoad: () => ({
    navDataFetcher: 'useOccurrenceAssignedNavData',
  }),
})

function RouteComponent() {
  return (
    <Occurrence from="/data/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/occurrences/$occurrenceId/" />
  )
}
