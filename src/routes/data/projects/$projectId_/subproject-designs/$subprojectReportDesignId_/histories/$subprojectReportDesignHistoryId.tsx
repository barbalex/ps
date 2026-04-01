import { createFileRoute } from '@tanstack/react-router'

import { SubprojectReportDesignHistoryCompare } from '../../../../../../../formsAndLists/subprojectReportDesign/HistoryCompare.tsx'

const from =
  '/data/projects/$projectId_/subproject-designs/$subprojectReportDesignId_/histories/$subprojectReportDesignHistoryId'

export const Route = createFileRoute(from)({
  component: SubprojectReportDesignHistoryCompare,
})
