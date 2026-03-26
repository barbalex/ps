import { createFileRoute } from '@tanstack/react-router'

import { PlaceActionReports } from '../../../../../../../../../../../formsAndLists/placeActionReports.tsx'
import { NotFound } from '../../../../../../../../../../../components/NotFound.tsx'
const from =
  '/data/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/places/$placeId2_/action-reports/'

export const Route = createFileRoute(from)({
  component: () => (
    <PlaceActionReports from="/data/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/places/$placeId2_/action-reports/" />
  ),
  notFoundComponent: NotFound,
})
