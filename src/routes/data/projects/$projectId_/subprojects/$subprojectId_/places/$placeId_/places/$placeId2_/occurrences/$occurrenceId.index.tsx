import { createFileRoute } from '@tanstack/react-router'

import { Occurrence } from '../../../../../../../../../../../formsAndLists/occurrence/index.tsx'

export const Route = createFileRoute(
  '/data/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/places/$placeId2_/occurrences/$occurrenceId/',
)({
  component: RouteComponent,
  beforeLoad: ({ params }) => {
    if (!params.projectId_ || params.projectId_ === 'undefined') {
      throw new Error('Invalid or missing projectId_ in route parameters')
    }
    if (!params.subprojectId_ || params.subprojectId_ === 'undefined') {
      throw new Error('Invalid or missing subprojectId_ in route parameters')
    }
    if (!params.placeId_ || params.placeId_ === 'undefined') {
      throw new Error('Invalid or missing placeId_ in route parameters')
    }
    if (!params.placeId2_ || params.placeId2_ === 'undefined') {
      throw new Error('Invalid or missing placeId2_ in route parameters')
    }
    if (!params.occurrenceId || params.occurrenceId === 'undefined') {
      throw new Error('Invalid or missing occurrenceId in route parameters')
    }
    return {
    navDataFetcher: 'useOccurrenceAssignedNavData',
  }
  },
})

function RouteComponent() {
  return (
    <Occurrence from="/data/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/places/$placeId2_/occurrences/$occurrenceId/" />
  )
}
