import { createFileRoute } from '@tanstack/react-router'

import { ActionReport } from '../../../../../../../../../../../../formsAndLists/actionReport/index.tsx'
const from =
  '/data/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/actions/$actionId_/reports/$actionReportId_/report'

export const Route = createFileRoute(from)({
  component: () => (
    <ActionReport from="/data/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/actions/$actionId_/reports/$actionReportId_/report" />
  ),
})
