import { createFileRoute } from '@tanstack/react-router'

import { PlaceReport } from '../../../../../../../../formsAndLists/placeReport/index.tsx'

export const Route = createFileRoute(
  '/data/_authLayout/projects/$projectId_/subprojects/$subprojectId_/reports/$placeReportId/',
)({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <PlaceReport from="/data/_authLayout/projects/$projectId_/subprojects/$subprojectId_/reports/$placeReportId/" />
  )
}
