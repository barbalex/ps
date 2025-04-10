import { createFileRoute } from '@tanstack/react-router'

import { SubprojectTaxon } from '../../../../../../../../../../formsAndLists/subprojectTaxon/index.tsx'

export const Route = createFileRoute(
  '/data/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/places/taxa/$subprojectTaxonId/',
)({
  component: RouteComponent,
})

const RouteComponent = () => {
  return (
    <SubprojectTaxon from="/data/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/places/taxa/$subprojectTaxonId/" />
  )
}
