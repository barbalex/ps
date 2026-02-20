import { createFileRoute } from '@tanstack/react-router'

import { OccurrenceNotToAssignFilter } from '../../../../../../../formsAndLists/occurrence/NotToAssignFilter.tsx'

const from =
  '/data/projects/$projectId_/subprojects/$subprojectId_/occurrences-not-to-assign/filter'

export const Route = createFileRoute(from)({
  component: () => <OccurrenceNotToAssignFilter from={from} />,
})
