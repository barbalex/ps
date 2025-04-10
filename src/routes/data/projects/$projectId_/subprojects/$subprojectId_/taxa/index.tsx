import { createFileRoute } from '@tanstack/react-router'

import { SubprojectTaxa } from '../../../../../../../formsAndLists/subprojectTaxa.tsx'
import { NotFound } from '../../../../../../../components/NotFound.tsx'

export const Route = createFileRoute(
  '/data/projects/$projectId_/subprojects/$subprojectId_/taxa/',
)({
  component: RouteComponent,
  notFoundComponent: NotFound,
})

const RouteComponent = () => {
  return (
    <SubprojectTaxa from="/data/projects/$projectId_/subprojects/$subprojectId_/taxa/" />
  )
}
