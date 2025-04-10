import { createFileRoute } from '@tanstack/react-router'

import { CheckTaxon } from '../../../../../../../../../../../formsAndLists/checkTaxon/index.tsx'

export const Route = createFileRoute(
  '/data/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/checks/$checkId_/taxa/$checkTaxonId/',
)({
  component: RouteComponent,
  beforeLoad: () => ({
    navDataFetcher: 'useCheckTaxonNavData',
  }),
})

function RouteComponent() {
  return (
    <CheckTaxon from="/data/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/checks/$checkId_/taxa/$checkTaxonId/" />
  )
}
