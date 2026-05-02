import { createFileRoute } from '@tanstack/react-router'

import { SubprojectReportHistoryCompare } from '../../../../../../../../../formsAndLists/subprojectReport/HistoryCompare.tsx'


export const Route = createFileRoute('/data/projects/$projectId_/subprojects/$subprojectId_/reports/$subprojectReportId_/histories/$subprojectReportHistoryId')({
  component: SubprojectReportHistoryCompare,
})
