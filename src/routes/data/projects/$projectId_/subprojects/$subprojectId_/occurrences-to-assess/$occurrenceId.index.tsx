import { createFileRoute } from '@tanstack/react-router'

import { Occurrence } from '../../../../../../../formsAndLists/occurrence/index.tsx'

export const Route = createFileRoute(
  '/data/projects/$projectId_/subprojects/$subprojectId_/occurrences-to-assess/$occurrenceId/',
)({
  component: RouteComponent,
  beforeLoad: ({ params }) => {
    if (!params.projectId_ || params.projectId_ === 'undefined') {
      throw new Error('Invalid or missing projectId_ in route parameters')
    }
    if (!params.subprojectId_ || params.subprojectId_ === 'undefined') {
      throw new Error('Invalid or missing subprojectId_ in route parameters')
    }
    if (!params.occurrenceId || params.occurrenceId === 'undefined') {
      throw new Error('Invalid or missing occurrenceId in route parameters')
    }
    return {
    navDataFetcher: 'useOccurrenceToAssessNavData',
  }
  },
})

function RouteComponent() {
  return (
    <Occurrence from="/data/projects/$projectId_/subprojects/$subprojectId_/occurrences-to-assess/$occurrenceId/" />
  )
}
