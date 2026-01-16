import { createFileRoute } from '@tanstack/react-router'

import { SubprojectReportPrint } from '../../../../../../../formsAndLists/subprojectReport/Print.tsx'

export const Route = createFileRoute(
  '/data/projects/$projectId_/subprojects/$subprojectId_/reports/$subprojectReportId/print',
)({
  component: RouteComponent,
  beforeLoad: () => ({
    navDataFetcher: 'useSubprojectReportNavData',
  }),
})

function RouteComponent() {
  return (
    <SubprojectReportPrint from="/data/projects/$projectId_/subprojects/$subprojectId_/reports/$subprojectReportId/print" />
  )
}
