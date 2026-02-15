import { createFileRoute } from '@tanstack/react-router'

import { Taxonomy } from '../../../../../../formsAndLists/taxonomy/index.tsx'

export const Route = createFileRoute(
  '/data/projects/$projectId_/taxonomies/$taxonomyId_/taxonomy',
)({
  component: RouteComponent,
  beforeLoad: ({ params }) => {
    if (!params.projectId_ || params.projectId_ === 'undefined') {
      throw new Error('Invalid or missing projectId_ in route parameters')
    }
    if (!params.taxonomyId_ || params.taxonomyId_ === 'undefined') {
      throw new Error('Invalid or missing taxonomyId_ in route parameters')
    }
    return {
    navDataFetcher: 'useTaxonomyTaxonomyNavData',
  }
  },
})

function RouteComponent() {
  return (
    <Taxonomy
      from={
        '/data/projects/$projectId_/taxonomies/$taxonomyId_/taxonomy'
      }
    />
  )
}
