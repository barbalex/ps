import { createFileRoute } from '@tanstack/react-router'

import { CheckReportList } from '../../../../../../../../../../../../formsAndLists/checkReport/List.tsx'
const from =
  '/data/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/checks/$checkId_/reports/$checkReportId_/'

export const Route = createFileRoute(from)({
  component: () => (
    <CheckReportList from="/data/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/checks/$checkId_/reports/$checkReportId_/" />
  ),
})
