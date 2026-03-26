import { createFileRoute } from '@tanstack/react-router'

import { PlaceCheckReportQuantities } from '../../../../../../../../../../../formsAndLists/placeCheckReportQuantities.tsx'
import { NotFound } from '../../../../../../../../../../../components/NotFound.tsx'
const from =
  '/data/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/check-reports/$placeReportId_/quantities/'

export const Route = createFileRoute(from)({
  component: () => (
    <PlaceCheckReportQuantities from="/data/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/check-reports/$placeReportId_/quantities/" />
  ),
  notFoundComponent: NotFound,
})
