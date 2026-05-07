import { createFileRoute } from '@tanstack/react-router'

import { ExportHistoryCompare } from '../../../../../formsAndLists/export/HistoryCompare.tsx'

export const Route = createFileRoute(
  '/data/exports/$exportsId_/histories/$exportsHistoryId',
)({
  component: ExportHistoryCompare,
})
