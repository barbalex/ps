import { createFileRoute } from '@tanstack/react-router'

import { PlaceActionReport } from '../../../../../../../../../../formsAndLists/placeActionReport/index.tsx'
const from =
  '/data/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/action-reports/$placeActionReportId_/report'

export const Route = createFileRoute(from)({
  component: () => (
    <PlaceActionReport from="/data/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/action-reports/$placeActionReportId_/report" />
  ),
  beforeLoad: () => ({
    navDataFetcher: 'usePlaceActionReportReportNavData',
  }),
})
