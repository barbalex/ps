import { createFileRoute } from '@tanstack/react-router'

import { SubprojectTaxon } from '../../../../../../../../../../../formsAndLists/subprojectTaxon/index.tsx'

export const Route = createFileRoute(
  '/data/_authLayout/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/places/$placeId2_/taxa/$subprojectTaxonId/',
)({
  component: RouteComponent,
})

const RouteComponent = () => {
  return (
    <SubprojectTaxon from="/data/_authLayout/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/places/taxa/$subprojectTaxonId/" />
  )
}
