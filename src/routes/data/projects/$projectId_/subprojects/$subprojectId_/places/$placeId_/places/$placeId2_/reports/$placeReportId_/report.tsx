import { createFileRoute } from '@tanstack/react-router'

import { PlaceReport } from '../../../../../../../../../../../../formsAndLists/placeReport/index.tsx'

export const Route = createFileRoute(
  '/data/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/places/$placeId2_/reports/$placeReportId_/report',
)({
  component: RouteComponent,
  beforeLoad: () => ({
    navDataFetcher: 'usePlaceReportReportNavData',
  }),
})

function RouteComponent() {
  return (
    <PlaceReport from="/data/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/places/$placeId2_/reports/$placeReportId_/report" />
  )
}
