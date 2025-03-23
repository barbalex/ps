import { createFileRoute } from '@tanstack/react-router'

import { ActionReports } from '../../../../../../../../../../../../../../formsAndLists/actionReports.tsx'
import { NotFound } from '../../../../../../../../../../../../../../components/NotFound.tsx'

export const Route = createFileRoute(
  '/data/_authLayout/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/places/$placeId2_/actions/$actionId_/reports/',
)({
  component: RouteComponent,
  notFoundComponent: NotFound,
})

function RouteComponent() {
  return (
    <ActionReports from="/data/_authLayout/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/places/$placeId2_/actions/$actionId_/reports/" />
  )
}
