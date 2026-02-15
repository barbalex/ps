import { createFileRoute } from '@tanstack/react-router'

import { Taxon } from '../../../../../../../formsAndLists/taxon/index.tsx'

export const Route = createFileRoute(
  '/data/projects/$projectId_/taxonomies/$taxonomyId_/taxa/$taxonId/',
)({
  component: Taxon,
  beforeLoad: ({ params }) => {
    if (!params.projectId_ || params.projectId_ === 'undefined') {
      throw new Error('Invalid or missing projectId_ in route parameters')
    }
    if (!params.taxonomyId_ || params.taxonomyId_ === 'undefined') {
      throw new Error('Invalid or missing taxonomyId_ in route parameters')
    }
    if (!params.taxonId || params.taxonId === 'undefined') {
      throw new Error('Invalid or missing taxonId in route parameters')
    }
    return {
    navDataFetcher: 'useTaxonNavData',
  }
  },
})
