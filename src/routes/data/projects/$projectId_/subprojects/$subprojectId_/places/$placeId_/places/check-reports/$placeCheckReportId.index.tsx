import { createFileRoute } from '@tanstack/react-router'

import { PlaceCheckReport } from '../../../../../../../../../../formsAndLists/placeCheckReport/index.tsx'
const from =
  '/data/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/places/check-reports/$placeCheckReportId/'

export const Route = createFileRoute(from)({
  component: () => (
    <PlaceCheckReport from="/data/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/places/check-reports/$placeCheckReportId/" />
  ),
})
