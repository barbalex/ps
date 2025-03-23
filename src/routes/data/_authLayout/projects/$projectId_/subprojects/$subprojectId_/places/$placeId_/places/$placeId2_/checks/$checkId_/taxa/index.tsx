import { createFileRoute } from '@tanstack/react-router'

import { CheckTaxa } from '../../../../../../../../../../../../../../../formsAndLists/checkTaxa.tsx'
import { NotFound } from '../../../../../../../../../../../../../../../components/NotFound.tsx'

export const Route = createFileRoute(
  '/data/_authLayout/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/places/$placeId2_/checks/$checkId_/taxa/',
)({
  component: RouteComponent,
  notFoundComponent: NotFound,
})

function RouteComponent() {
  return (
    <CheckTaxa from="/data/_authLayout/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/checks/$checkId_/taxa/" />
  )
}
