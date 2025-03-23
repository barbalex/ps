import { createFileRoute } from '@tanstack/react-router'

import { Action } from '../../../../../../../../../../../../formsAndLists/action/index.tsx'

export const Route = createFileRoute(
  '/data/_authLayout/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/places/$placeId2_/actions/$actionId/',
)({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <Action
      level={1}
      from="/data/_authLayout/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/places/$placeId2_/actions/$actionId/"
    />
  )
}
