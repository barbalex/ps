import { createFileRoute } from '@tanstack/react-router'

import { OccurrenceImportFilter } from '../../../../../../../formsAndLists/occurrenceImport/Filter.tsx'

const from =
  '/data/projects/$projectId_/subprojects/$subprojectId_/occurrence-imports/filter'

export const Route = createFileRoute(from)({
  component: () => <OccurrenceImportFilter from={from} />,
})
