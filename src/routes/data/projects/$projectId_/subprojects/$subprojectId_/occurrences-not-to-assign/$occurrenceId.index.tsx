import { createFileRoute } from '@tanstack/react-router'

import { Occurrence } from '../../../../../../../formsAndLists/occurrence/index.tsx'

export const Route = createFileRoute(
  '/data/projects/$projectId_/subprojects/$subprojectId_/occurrences-not-to-assign/$occurrenceId/',
)({
  component: RouteComponent,
  beforeLoad: ({ params }) => {
    if (!params.projectId || params.projectId === 'undefined') {
      throw new Error('Invalid or missing projectId in route parameters')
    }
    if (!params.subprojectId || params.subprojectId === 'undefined') {
      throw new Error('Invalid or missing subprojectId in route parameters')
    }
    if (!params.occurrenceId || params.occurrenceId === 'undefined') {
      throw new Error('Invalid or missing occurrenceId in route parameters')
    }
    return {
    navDataFetcher: 'useOccurrenceNotToAssignNavData',
  }
  },
})

function RouteComponent() {
  return (
    <Occurrence from="/data/projects/$projectId_/subprojects/$subprojectId_/occurrences-not-to-assign/$occurrenceId/" />
  )
}
