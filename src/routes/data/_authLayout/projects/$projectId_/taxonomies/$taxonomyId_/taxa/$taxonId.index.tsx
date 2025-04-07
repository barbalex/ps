import { createFileRoute } from '@tanstack/react-router'

import { Taxon } from '../../../../../../../../formsAndLists/taxon/index.tsx'

export const Route = createFileRoute(
  '/data/_authLayout/projects/$projectId_/taxonomies/$taxonomyId_/taxa/$taxonId/',
)({
  component: Taxon,
  beforeLoad: () => ({
    navDataFetcher: 'useTaxonNavData',
  }),
})
