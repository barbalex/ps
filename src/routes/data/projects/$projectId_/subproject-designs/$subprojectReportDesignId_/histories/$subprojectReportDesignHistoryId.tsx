import { createFileRoute } from '@tanstack/react-router'

import { SubprojectReportDesignHistoryCompare } from '../../../../../../../formsAndLists/subprojectReportDesign/HistoryCompare.tsx'


export const Route = createFileRoute('/data/projects/$projectId_/subproject-designs/$subprojectReportDesignId_/histories/$subprojectReportDesignHistoryId')({
  component: SubprojectReportDesignHistoryCompare,
})
