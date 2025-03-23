import { createFileRoute } from '@tanstack/react-router'

import { Actions } from '../../../../../../../../../../../../../formsAndLists/actions.tsx'
import { NotFound } from '../../../../../../../../../../../../../components/NotFound.tsx'

export const Route = createFileRoute(
  '/data/_authLayout/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/places/$placeId2_/actions/',
)({
  component: RouteComponent,
  notFoundComponent: NotFound,
})

function RouteComponent() {
  return (
    <Actions from="/data/_authLayout/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/actions/" />
  )
}
