import { createFileRoute } from '@tanstack/react-router'

import { ActionList } from '../../../../../../../../../../formsAndLists/action/List.tsx'

export const Route = createFileRoute(
  '/data/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/actions/$actionId_/',
)({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <ActionList from="/data/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/actions/$actionId_/" />
  )
}
