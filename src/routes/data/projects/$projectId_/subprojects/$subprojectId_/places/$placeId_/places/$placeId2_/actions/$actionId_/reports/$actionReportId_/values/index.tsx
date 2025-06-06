import { createFileRoute } from '@tanstack/react-router'

import { ActionReportValues } from '../../../../../../../../../../../../../../../formsAndLists/actionReportValues.tsx'

export const Route = createFileRoute(
  '/data/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/places/$placeId2_/actions/$actionId_/reports/$actionReportId_/values/',
)({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <ActionReportValues from="/data/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/places/$placeId2_/actions/$actionId_/reports/$actionReportId_/values/" />
  )
}
