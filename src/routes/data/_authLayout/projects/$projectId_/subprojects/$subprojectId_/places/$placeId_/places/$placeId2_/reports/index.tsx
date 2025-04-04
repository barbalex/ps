import { createFileRoute } from '@tanstack/react-router'

import { PlaceReports } from '../../../../../../../../../../../../formsAndLists/placeReports.tsx'
import { NotFound } from '../../../../../../../../../../../../components/NotFound.tsx'

export const Route = createFileRoute(
  '/data/_authLayout/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/places/$placeId2_/reports/',
)({
  component: RouteComponent,
  notFoundComponent: NotFound,
})

const RouteComponent = () => {
  return (
    <PlaceReports from="/data/_authLayout/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/places/$placeId2_/reports/" />
  )
}
