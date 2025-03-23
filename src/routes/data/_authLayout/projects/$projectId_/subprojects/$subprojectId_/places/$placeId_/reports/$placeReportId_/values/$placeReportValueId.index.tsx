import { createFileRoute } from '@tanstack/react-router'

import { PlaceReportValue } from '../../../../../../../../../../../../formsAndLists/placeReportValue/index.tsx'

export const Route = createFileRoute(
  '/data/_authLayout/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/reports/$placeReportId_/values/$placeReportValueId/',
)({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <PlaceReportValue from="/data/_authLayout/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/reports/$placeReportId_/values/$placeReportValueId/" />
  )
}
