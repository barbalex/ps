import { createFileRoute } from '@tanstack/react-router'

import { PlaceCheckReportIndex } from '../../../../../../../../../../../../formsAndLists/placeCheckReport/Index.tsx'
const from =
  '/data/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/places/$placeId2_/check-reports/$placeCheckReportId_/'

export const Route = createFileRoute(from)({
  component: () => (
    <PlaceCheckReportIndex from="/data/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/places/$placeId2_/check-reports/$placeCheckReportId_/" />
  ),
})
