import { createFileRoute } from '@tanstack/react-router'

import { ActionReportList } from '../../../../../../../../../../../../formsAndLists/actionReport/List.tsx'
const from =
  '/data/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/actions/$actionId_/reports/$actionReportId_/'

export const Route = createFileRoute(from)({
  component: () => (
    <ActionReportList from="/data/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/actions/$actionId_/reports/$actionReportId_/" />
  ),
})
