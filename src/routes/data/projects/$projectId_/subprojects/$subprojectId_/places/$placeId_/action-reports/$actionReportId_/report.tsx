import { createFileRoute } from '@tanstack/react-router'

import { ActionReport } from '../../../../../../../../../../formsAndLists/actionReport/ActionReport.tsx'

export const Route = createFileRoute('/data/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/action-reports/$actionReportId_/report')({
  component: () => (
    <ActionReport from="/data/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/action-reports/$actionReportId_/report" />
  ),
  beforeLoad: () => ({
    navDataFetcher: 'useActionReportReportNavData',
  }),
})
