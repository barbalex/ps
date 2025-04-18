import { createFileRoute } from '@tanstack/react-router'

import { PlaceReportValue } from '../../../../../../../../../../../formsAndLists/placeReportValue/index.tsx'

export const Route = createFileRoute(
  '/data/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/places/reports/values/$placeReportValueId',
)({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <PlaceReportValue from="/data/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/places/reports/values/$placeReportValueId" />
  )
}
