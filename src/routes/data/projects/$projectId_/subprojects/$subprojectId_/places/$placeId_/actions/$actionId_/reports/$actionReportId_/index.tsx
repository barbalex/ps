import { createFileRoute } from '@tanstack/react-router'

import { ActionReportIndex } from '../../../../../../../../../../../../formsAndLists/actionReport/Index.tsx'
const from =
  '/data/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/actions/$actionId_/reports/$actionReportId_/'

export const Route = createFileRoute(from)({
  component: () => (
    <ActionReportIndex from="/data/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/actions/$actionId_/reports/$actionReportId_/" />
  ),
})
