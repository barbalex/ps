import { createFileRoute } from '@tanstack/react-router'

import { PlaceReport } from '../../../../../../../../../../../../formsAndLists/placeReport/index.tsx'
const from =
  '/data/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/places/$placeId2_/reports/$placeReportId_/report'

export const Route = createFileRoute(from)({
  component: () => (
    <PlaceReport from="/data/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/places/$placeId2_/reports/$placeReportId_/report" />
  ),
  beforeLoad: () => ({
    navDataFetcher: 'usePlaceReportReportNavData',
  }),
})
