import { createFileRoute } from '@tanstack/react-router'

import { ObservationImportFilter } from '../../../../../../../formsAndLists/observationImport/Filter.tsx'

const from =
  '/data/projects/$projectId_/subprojects/$subprojectId_/observation-imports/filter'

export const Route = createFileRoute(from)({
  component: () => <ObservationImportFilter from={from} />,
})
