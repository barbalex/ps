import { createFileRoute } from '@tanstack/react-router'

import { ActionValues } from '../../../../../../../../../../../../../../formsAndLists/actionValues.tsx'
import { NotFound } from '../../../../../../../../../../../../../../components/NotFound.tsx'

export const Route = createFileRoute(
  '/data/_authLayout/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/places/$placeId2_/actions/$actionId_/values/',
)({
  component: RouteComponent,
  notFoundComponent: NotFound,
})

function RouteComponent() {
  return (
    <ActionValues from="/data/_authLayout/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/places/$placeId2_/actions/$actionId_/values/" />
  )
}
