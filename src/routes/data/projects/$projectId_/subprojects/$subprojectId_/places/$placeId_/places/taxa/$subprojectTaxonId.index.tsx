import { createFileRoute } from '@tanstack/react-router'

import { SubprojectTaxon } from '../../../../../../../../../../formsAndLists/subprojectTaxon/index.tsx'
const from =
  '/data/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/places/taxa/$subprojectTaxonId/'

export const Route = createFileRoute(from)({
  component: () => (
    <SubprojectTaxon from="/data/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/places/taxa/$subprojectTaxonId/" />
  ),
})
