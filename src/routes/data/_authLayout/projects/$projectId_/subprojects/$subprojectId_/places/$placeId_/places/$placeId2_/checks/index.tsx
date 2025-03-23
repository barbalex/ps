import { createFileRoute } from '@tanstack/react-router'

import { Checks } from '../../../../../../../../../../../../formsAndLists/checks.tsx'
import { NotFound } from '../../../../../../../../../../../../components/NotFound.tsx'

export const Route = createFileRoute(
  '/data/_authLayout/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/places/$placeId2_/checks/',
)({
  component: RouteComponent,
  notFoundComponent: NotFound,
})

function RouteComponent() {
  return (
    <Checks from="/data/_authLayout/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/places/$placeId2_/checks/" />
  )
}
