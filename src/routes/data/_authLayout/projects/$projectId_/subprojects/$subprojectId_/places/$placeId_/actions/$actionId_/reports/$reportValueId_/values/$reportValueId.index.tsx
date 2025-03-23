import { createFileRoute } from '@tanstack/react-router'

import { ActionReportValue } from '../../../../../../../../../../../../../../formsAndLists/actionReportValue/index.tsx'

export const Route = createFileRoute(
  '/data/_authLayout/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/actions/$actionId_/reports/$reportValueId_/values/$reportValueId/',
)({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <ActionReportValue from="/data/_authLayout/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/actions/$actionId_/reports/$reportValueId_/values/" />
  )
}
