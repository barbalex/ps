import { createFileRoute } from '@tanstack/react-router'

import { PlaceActionReportIndex } from '../../../../../../../../../../../../formsAndLists/placeActionReport/Index.tsx'
const from =
  '/data/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/places/$placeId2_/action-reports/$placeActionReportId_/'

export const Route = createFileRoute(from)({
  component: () => (
    <PlaceActionReportIndex from="/data/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/places/$placeId2_/action-reports/$placeActionReportId_/" />
  ),
})
