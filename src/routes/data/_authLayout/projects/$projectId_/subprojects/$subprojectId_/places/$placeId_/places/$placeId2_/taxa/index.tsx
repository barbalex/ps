import { createFileRoute } from '@tanstack/react-router'

import { SubprojectTaxa } from '../../../../../../../../../../../formsAndLists/subprojectTaxa.tsx'
import { NotFound } from '../../../../../../../../../../../components/NotFound.tsx'

export const Route = createFileRoute(
  '/data/_authLayout/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/places/$placeId2_/taxa/',
)({
  component: RouteComponent,
  notFoundComponent: NotFound,
})

const RouteComponent = () => {
  return (
    <SubprojectTaxa from="/data/_authLayout/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/places/taxa/" />
  )
}
