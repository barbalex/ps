import { createFileRoute } from '@tanstack/react-router'

import { Checks } from '../../../../../../../../../../formsAndLists/checks.tsx'

export const Route = createFileRoute(
  '/data/_authLayout/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/checks/',
)({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <Checks from="/data/_authLayout/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/checks/" />
  )
}
