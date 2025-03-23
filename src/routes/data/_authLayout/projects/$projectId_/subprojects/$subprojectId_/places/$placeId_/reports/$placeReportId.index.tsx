import { createFileRoute } from '@tanstack/react-router'

import { PlaceReport } from '../../../../../../../../../../formsAndLists/placeReport/index.tsx'
import { NotFound } from '../../../../../../../../../../components/NotFound.tsx'

export const Route = createFileRoute(
  '/data/_authLayout/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/reports/$placeReportId/',
)({
  component: RouteComponent,
  notFoundComponent: NotFound,
})

function RouteComponent() {
  return (
    <PlaceReport from="/data/_authLayout/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/reports/$placeReportId/" />
  )
}
