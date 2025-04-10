import { createFileRoute } from '@tanstack/react-router'

import { Action } from '../../../../../../../../../../formsAndLists/action/index.tsx'

export const Route = createFileRoute(
  '/data/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/actions/$actionId_/action',
)({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <Action from="/data/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/actions/$actionId_/action" />
  )
}
