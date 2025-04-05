import { createFileRoute } from '@tanstack/react-router'

import { ActionReportList } from '../../../../../../../../../../../../formsAndLists/actionReport/List.tsx'

export const Route = createFileRoute(
  '/data/_authLayout/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/actions/$actionId_/reports/$actionReportId/',
)({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <ActionReportList from="/data/_authLayout/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/actions/$actionId_/reports/$actionReportId/" />
  )
}
