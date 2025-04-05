import { createFileRoute } from '@tanstack/react-router'

import { ActionList } from '../../../../../../../../../../formsAndLists/action/List.tsx'

export const Route = createFileRoute(
  '/data/_authLayout/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/actions/$actionId/',
)({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <ActionList from="/data/_authLayout/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/actions/$actionId/" />
  )
}
