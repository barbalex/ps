import { createFileRoute } from '@tanstack/react-router'

import { Taxonomy } from '../../../../../../formsAndLists/taxonomy/index.tsx'
const from = '/data/projects/$projectId_/taxonomies/$taxonomyId_/taxonomy'

export const Route = createFileRoute(from)({
  component: () => (
    <Taxonomy
      from={'/data/projects/$projectId_/taxonomies/$taxonomyId_/taxonomy'}
    />
  ),
  beforeLoad: ({ params }) => {
    if (!params.projectId || params.projectId === 'undefined') {
      throw new Error('Invalid or missing projectId in route parameters')
    }
    if (!params.taxonomyId || params.taxonomyId === 'undefined') {
      throw new Error('Invalid or missing taxonomyId in route parameters')
    }
    return {
      navDataFetcher: 'useTaxonomyTaxonomyNavData',
    }
  },
})
