import { createFileRoute } from '@tanstack/react-router'

import { SubprojectTaxon } from '../../../../../../../formsAndLists/subprojectTaxon/index.tsx'

export const Route = createFileRoute(
  '/data/projects/$projectId_/subprojects/$subprojectId_/taxa/$subprojectTaxonId/',
)({
  component: RouteComponent,
  beforeLoad: ({ params }) => {
    if (!params.projectId_ || params.projectId_ === 'undefined') {
      throw new Error('Invalid or missing projectId_ in route parameters')
    }
    if (!params.subprojectId_ || params.subprojectId_ === 'undefined') {
      throw new Error('Invalid or missing subprojectId_ in route parameters')
    }
    if (!params.subprojectTaxonId || params.subprojectTaxonId === 'undefined') {
      throw new Error('Invalid or missing subprojectTaxonId in route parameters')
    }
    return {
    navDataFetcher: 'useSubprojectTaxonNavData',
  }
  },
})

const RouteComponent = () => {
  return (
    <SubprojectTaxon from="/data/projects/$projectId_/subprojects/$subprojectId_/taxa/$subprojectTaxonId/" />
  )
}
