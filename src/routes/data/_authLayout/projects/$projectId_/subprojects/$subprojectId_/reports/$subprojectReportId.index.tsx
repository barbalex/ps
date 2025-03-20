import { createFileRoute } from '@tanstack/react-router'

import { SubprojectReport } from '../../../../../../../../formsAndLists/subprojectReport/index.tsx'

export const Route = createFileRoute(
  '/data/_authLayout/projects/$projectId_/subprojects/$subprojectId_/reports/$subprojectReportId/',
)({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <SubprojectReport from="/data/_authLayout/projects/$projectId_/subprojects/$subprojectId_/reports/$subprojectReportId/" />
  )
}
