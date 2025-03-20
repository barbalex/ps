import { createFileRoute } from '@tanstack/react-router'

import { Places } from '../../../../../../../../formsAndLists/places.tsx'
import { NotFound } from '../../../../../../../../components/NotFound.tsx'

export const Route = createFileRoute(
  '/data/_authLayout/projects/$projectId_/subprojects/$subprojectId_/places/',
)({
  component: RouteComponent,
  notFoundComponent: NotFound,
})

function RouteComponent() {
  return (
    <Places from="/data/_authLayout/projects/$projectId_/subprojects/$subprojectId_/places/" />
  )
}
