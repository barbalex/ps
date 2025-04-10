import { createFileRoute } from '@tanstack/react-router'

import { SubprojectReport } from '../../../../../../../formsAndLists/subprojectReport/index.tsx'

export const Route = createFileRoute(
  '/data/projects/$projectId_/subprojects/$subprojectId_/reports/$subprojectReportId/',
)({
  component: RouteComponent,
  beforeLoad: () => ({
    navDataFetcher: 'useSubprojectReportNavData',
  }),
})

function RouteComponent() {
  return (
    <SubprojectReport from="/data/projects/$projectId_/subprojects/$subprojectId_/reports/$subprojectReportId/" />
  )
}
