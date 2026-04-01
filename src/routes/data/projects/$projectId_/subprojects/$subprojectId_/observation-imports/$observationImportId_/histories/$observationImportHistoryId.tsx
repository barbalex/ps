import { createFileRoute } from '@tanstack/react-router'

import { ObservationImportHistoryCompare } from '../../../../../../../../../formsAndLists/observationImport/HistoryCompare.tsx'

const from =
  '/data/projects/$projectId_/subprojects/$subprojectId_/observation-imports/$observationImportId_/histories/$observationImportHistoryId'

export const Route = createFileRoute(from)({
  component: ObservationImportHistoryCompare,
})
