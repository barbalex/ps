import { createFileRoute } from '@tanstack/react-router'

import { PlaceReportValues } from '../../../../../../../../../../../formsAndLists/placeReportValues.tsx'
import { NotFound } from '../../../../../../../../../../../components/NotFound.tsx'

export const Route = createFileRoute(
  '/data/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/places/reports/values/',
)({
  component: RouteComponent,
  notFoundComponent: NotFound,
})

function RouteComponent() {
  return (
    <PlaceReportValues from="/data/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/places/reports/values/" />
  )
}
