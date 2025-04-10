import { createFileRoute } from '@tanstack/react-router'

import { PlaceReports } from '../../../../../../../../../../formsAndLists/placeReports.tsx'
import { NotFound } from '../../../../../../../../../../components/NotFound.tsx'

export const Route = createFileRoute(
  '/data/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/places/reports/',
)({
  component: RouteComponent,
  notFoundComponent: NotFound,
})

const RouteComponent = () => {
  return (
    <PlaceReports from="/data/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/places/reports/" />
  )
}
