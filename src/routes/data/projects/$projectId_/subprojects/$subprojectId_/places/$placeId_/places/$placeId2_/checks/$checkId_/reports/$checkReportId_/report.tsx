import { createFileRoute } from '@tanstack/react-router'

import { CheckReport } from '../../../../../../../../../../../../../../formsAndLists/checkReport/index.tsx'
const from =
  '/data/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/places/$placeId2_/checks/$checkId_/reports/$checkReportId_/report'

export const Route = createFileRoute(from)({
  component: () => (
    <CheckReport from="/data/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/places/$placeId2_/checks/$checkId_/reports/$checkReportId_/report" />
  ),
})
