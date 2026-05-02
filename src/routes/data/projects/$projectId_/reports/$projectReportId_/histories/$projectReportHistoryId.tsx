import { createFileRoute } from '@tanstack/react-router'

import { ProjectReportHistoryCompare } from '../../../../../../../formsAndLists/projectReport/HistoryCompare.tsx'


export const Route = createFileRoute('/data/projects/$projectId_/reports/$projectReportId_/histories/$projectReportHistoryId')({
  component: ProjectReportHistoryCompare,
})
