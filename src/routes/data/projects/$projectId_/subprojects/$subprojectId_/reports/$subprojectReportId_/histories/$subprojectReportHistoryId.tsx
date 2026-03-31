import { createFileRoute } from '@tanstack/react-router'

import { SubprojectReportHistoryCompare } from '../../../../../../../../../formsAndLists/subprojectReport/HistoryCompare.tsx'

const from =
  '/data/projects/$projectId_/subprojects/$subprojectId_/reports/$subprojectReportId_/histories/$subprojectReportHistoryId'

export const Route = createFileRoute(from)({
  component: SubprojectReportHistoryCompare,
})
