import { createFileRoute } from '@tanstack/react-router'

import { CheckTaxon } from '../../../../../../../../../../../../../../formsAndLists/checkTaxon/index.tsx'

export const Route = createFileRoute(
  '/data/_authLayout/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/places/$placeId2_/checks/$checkId_/taxa/$checkTaxonId/',
)({
  component: RouteComponent,
  beforeLoad: () => ({
    navDataFetcher: 'useTaxonNavData',
  }),
})

function RouteComponent() {
  return (
    <CheckTaxon from="/data/_authLayout/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/places/$placeId2_/checks/$checkId_/taxa/$checkTaxonId/" />
  )
}
