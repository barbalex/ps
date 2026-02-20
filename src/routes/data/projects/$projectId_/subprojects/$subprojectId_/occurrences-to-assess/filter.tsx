import { createFileRoute } from '@tanstack/react-router'

import { OccurrenceToAssessFilter } from '../../../../../../../formsAndLists/occurrence/ToAssessFilter.tsx'

const from =
  '/data/projects/$projectId_/subprojects/$subprojectId_/occurrences-to-assess/filter'

export const Route = createFileRoute(from)({
  component: () => <OccurrenceToAssessFilter from={from} />,
})
