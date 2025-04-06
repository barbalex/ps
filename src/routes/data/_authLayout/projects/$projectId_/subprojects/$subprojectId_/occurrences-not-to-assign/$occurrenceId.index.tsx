import { createFileRoute } from '@tanstack/react-router'

import { Occurrence } from '../../../../../../../../formsAndLists/occurrence/index.tsx'

export const Route = createFileRoute(
  '/data/_authLayout/projects/$projectId_/subprojects/$subprojectId_/occurrences-not-to-assign/$occurrenceId/',
)({
  component: RouteComponent,
  beforeLoad: () => ({
    navDataFetcher: 'useOccurrenceNavData',
  }),
})

function RouteComponent() {
  return (
    <Occurrence from="/data/_authLayout/projects/$projectId_/subprojects/$subprojectId_/occurrences-not-to-assign/$occurrenceId/" />
  )
}
