import { createFileRoute } from '@tanstack/react-router'

import { ProjectReportHistoryCompare } from '../../../../../../../formsAndLists/projectReport/HistoryCompare.tsx'

const from =
  '/data/projects/$projectId_/reports/$projectReportId_/histories/$projectReportHistoryId'

export const Route = createFileRoute(from)({
  component: ProjectReportHistoryCompare,
})
