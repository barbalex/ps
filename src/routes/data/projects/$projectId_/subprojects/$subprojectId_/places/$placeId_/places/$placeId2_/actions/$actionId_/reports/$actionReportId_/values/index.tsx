import { createFileRoute } from '@tanstack/react-router'

import { ActionReportValues } from '../../../../../../../../../../../../../../../formsAndLists/actionReportValues.tsx'
const from =
  '/data/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/places/$placeId2_/actions/$actionId_/reports/$actionReportId_/values/'

export const Route = createFileRoute(from)({
  component: () => (
    <ActionReportValues from="/data/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/places/$placeId2_/actions/$actionId_/reports/$actionReportId_/values/" />
  ),
})
