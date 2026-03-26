import { createFileRoute } from '@tanstack/react-router'

import { PlaceActionReportIndex } from '../../../../../../../../../../formsAndLists/placeActionReport/Index.tsx'
import { NotFound } from '../../../../../../../../../../components/NotFound.tsx'
const from =
  '/data/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/action-reports/$placeActionReportId_/'

export const Route = createFileRoute(from)({
  component: () => (
    <PlaceActionReportIndex from="/data/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/action-reports/$placeActionReportId_/" />
  ),
  notFoundComponent: NotFound,
})
