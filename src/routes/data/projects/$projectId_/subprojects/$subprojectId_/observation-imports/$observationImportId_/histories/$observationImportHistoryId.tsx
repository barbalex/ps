import { createFileRoute } from '@tanstack/react-router'

import { ObservationImportHistoryCompare } from '../../../../../../../../../formsAndLists/observationImport/HistoryCompare.tsx'


export const Route = createFileRoute('/data/projects/$projectId_/subprojects/$subprojectId_/observation-imports/$observationImportId_/histories/$observationImportHistoryId')({
  component: ObservationImportHistoryCompare,
})
