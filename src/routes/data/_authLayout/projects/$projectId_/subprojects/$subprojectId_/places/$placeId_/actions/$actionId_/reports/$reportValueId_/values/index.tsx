import { createFileRoute } from '@tanstack/react-router'

import { ActionReportValues } from '../../../../../../../../../../../../../../formsAndLists/actionReportValues.tsx'

export const Route = createFileRoute(
  '/data/_authLayout/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/actions/$actionId_/reports/$reportValueId_/values/',
)({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <ActionReportValues from="/data/_authLayout/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/actions/$actionId_/reports/$reportValueId_/values/" />
  )
}
