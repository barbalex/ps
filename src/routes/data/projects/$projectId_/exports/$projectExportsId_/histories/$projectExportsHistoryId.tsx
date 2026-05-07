import { createFileRoute } from '@tanstack/react-router'

import { ProjectExportHistoryCompare } from '../../../../../../../formsAndLists/projectExport/HistoryCompare.tsx'

export const Route = createFileRoute(
  '/data/projects/$projectId_/exports/$projectExportsId_/histories/$projectExportsHistoryId',
)({
  component: ProjectExportHistoryCompare,
})
