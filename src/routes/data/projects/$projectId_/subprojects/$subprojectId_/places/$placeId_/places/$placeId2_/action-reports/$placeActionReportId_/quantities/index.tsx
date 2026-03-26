import { createFileRoute } from '@tanstack/react-router'

import { PlaceActionReportQuantities } from '../../../../../../../../../../../../../formsAndLists/placeActionReportQuantities.tsx'
import { NotFound } from '../../../../../../../../../../../../../components/NotFound.tsx'
const from =
  '/data/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/places/$placeId2_/action-reports/$placeActionReportId_/quantities/'

export const Route = createFileRoute(from)({
  component: () => (
    <PlaceActionReportQuantities from="/data/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/places/$placeId2_/action-reports/$placeActionReportId_/quantities/" />
  ),
  notFoundComponent: NotFound,
})
