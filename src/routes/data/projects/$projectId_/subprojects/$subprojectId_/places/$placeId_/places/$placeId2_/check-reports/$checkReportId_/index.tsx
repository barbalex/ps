import { createFileRoute } from '@tanstack/react-router'

import { CheckReportIndex } from '../../../../../../../../../../../../formsAndLists/checkReport/Index.tsx'
const from =
  '/data/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/places/$placeId2_/check-reports/$checkReportId_/'

export const Route = createFileRoute(from)({
  component: () => (
    <CheckReportIndex from="/data/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/places/$placeId2_/check-reports/$checkReportId_/" />
  ),
})
