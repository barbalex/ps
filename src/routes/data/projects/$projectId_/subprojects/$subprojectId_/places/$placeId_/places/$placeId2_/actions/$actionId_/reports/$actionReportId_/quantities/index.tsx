import { createFileRoute } from '@tanstack/react-router'

import { ActionReportQuantities } from '../../../../../../../../../../../../../../../formsAndLists/actionReportQuantities.tsx'
import { NotFound } from '../../../../../../../../../../../../../../../components/NotFound.tsx'
const from =
  '/data/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/places/$placeId2_/actions/$actionId_/reports/$actionReportId_/quantities/'

export const Route = createFileRoute(from)({
  component: () => (
    <ActionReportQuantities from="/data/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/places/$placeId2_/actions/$actionId_/reports/$actionReportId_/quantities/" />
  ),
  notFoundComponent: NotFound,
})
