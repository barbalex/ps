import { createFileRoute } from '@tanstack/react-router'

import { CheckTaxon } from '../../../../../../../../../../../formsAndLists/checkTaxon/index.tsx'

export const Route = createFileRoute(
  '/data/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/checks/$checkId_/taxa/$checkTaxonId/',
)({
  component: RouteComponent,
  beforeLoad: ({ params }) => {
    if (!params.projectId_ || params.projectId_ === 'undefined') {
      throw new Error('Invalid or missing projectId_ in route parameters')
    }
    if (!params.subprojectId_ || params.subprojectId_ === 'undefined') {
      throw new Error('Invalid or missing subprojectId_ in route parameters')
    }
    if (!params.placeId_ || params.placeId_ === 'undefined') {
      throw new Error('Invalid or missing placeId_ in route parameters')
    }
    if (!params.checkId_ || params.checkId_ === 'undefined') {
      throw new Error('Invalid or missing checkId_ in route parameters')
    }
    if (!params.checkTaxonId || params.checkTaxonId === 'undefined') {
      throw new Error('Invalid or missing checkTaxonId in route parameters')
    }
    return {
    navDataFetcher: 'useCheckTaxonNavData',
  }
  },
})

function RouteComponent() {
  return (
    <CheckTaxon from="/data/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/checks/$checkId_/taxa/$checkTaxonId/" />
  )
}
