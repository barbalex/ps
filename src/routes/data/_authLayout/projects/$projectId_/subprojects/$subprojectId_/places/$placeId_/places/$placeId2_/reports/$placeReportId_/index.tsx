import { createFileRoute } from '@tanstack/react-router'

import { PlaceReportList } from '../../../../../../../../../../../../../formsAndLists/placeReport/List.tsx'

export const Route = createFileRoute(
  '/data/_authLayout/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/places/$placeId2_/reports/$placeReportId_/',
)({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <PlaceReportList from="/data/_authLayout/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/places/$placeId2_/reports/$placeReportId_/" />
  )
}
