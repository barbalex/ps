import { createFileRoute } from '@tanstack/react-router'

import { ActionReportList } from '../../../../../../../../../../../../formsAndLists/actionReport/List.tsx'

export const Route = createFileRoute(
  '/data/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/actions/$actionId_/reports/$actionReportId_/',
)({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <ActionReportList from="/data/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/actions/$actionId_/reports/$actionReportId_/" />
  )
}
