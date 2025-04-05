import { createFileRoute } from '@tanstack/react-router'

import { CheckList } from '../../../../../../../../../../formsAndLists/check/List.tsx'

export const Route = createFileRoute(
  '/data/_authLayout/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/checks/$checkId/',
)({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <CheckList from="/data/_authLayout/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/checks/$checkId/" />
  )
}
