import { createFileRoute } from '@tanstack/react-router'

import { Action } from '../../../../../../../../../../../../../formsAndLists/action/index.tsx'

export const Route = createFileRoute(
  '/data/_authLayout/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/places/$placeId2_/actions/$actionId_/action',
)({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <Action from="/data/_authLayout/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/places/$placeId2_/actions/$actionId_/action" />
  )
}
