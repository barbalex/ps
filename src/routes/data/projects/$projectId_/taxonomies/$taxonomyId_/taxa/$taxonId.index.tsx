import { createFileRoute } from '@tanstack/react-router'

import { Taxon } from '../../../../../../../formsAndLists/taxon/index.tsx'

export const Route = createFileRoute(
  '/data/projects/$projectId_/taxonomies/$taxonomyId_/taxa/$taxonId/',
)({
  component: Taxon,
  beforeLoad: ({ params }) => {
    if (!params.projectId || params.projectId === 'undefined') {
      throw new Error('Invalid or missing projectId in route parameters')
    }
    if (!params.taxonomyId || params.taxonomyId === 'undefined') {
      throw new Error('Invalid or missing taxonomyId in route parameters')
    }
    if (!params.taxonId || params.taxonId === 'undefined') {
      throw new Error('Invalid or missing taxonId in route parameters')
    }
    return {
    navDataFetcher: 'useTaxonNavData',
  }
  },
})
