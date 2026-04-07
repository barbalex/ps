import { createFileRoute } from '@tanstack/react-router'

import { ActionReportIndex } from '../../../../../../../../../../../../formsAndLists/actionReport/index.tsx'
const from =
  '/data/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/places/$placeId2_/action-reports/$actionReportId_/'

export const Route = createFileRoute(from)({
  component: () => (
    <ActionReportIndex from="/data/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/places/$placeId2_/action-reports/$actionReportId_/" />
  ),
})
