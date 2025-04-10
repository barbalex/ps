import { createFileRoute } from '@tanstack/react-router'

import { CheckList } from '../../../../../../../../../../formsAndLists/check/List.tsx'

export const Route = createFileRoute(
  '/data/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/checks/$checkId_/',
)({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <CheckList from="/data/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/checks/$checkId_/" />
  )
}
