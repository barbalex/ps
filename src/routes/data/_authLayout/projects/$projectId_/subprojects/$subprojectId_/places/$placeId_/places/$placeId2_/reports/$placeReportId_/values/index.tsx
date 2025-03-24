import { createFileRoute } from '@tanstack/react-router'

import { PlaceReportValues } from '../../../../../../../../../../../../../../formsAndLists/placeReportValues.tsx'
import { NotFound } from '../../../../../../../../../../../../../../components/NotFound.tsx'

export const Route = createFileRoute(
  '/data/_authLayout/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/places/$placeId2_/reports/$placeReportId_/values/',
)({
  component: RouteComponent,
  notFoundComponent: NotFound,
})

function RouteComponent() {
  return (
    <PlaceReportValues from="/data/_authLayout/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/places/$placeId2_/reports/$placeReportId_/values/" />
  )
}
