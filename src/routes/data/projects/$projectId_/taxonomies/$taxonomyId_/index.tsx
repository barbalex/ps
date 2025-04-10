import { createFileRoute } from '@tanstack/react-router'

import { TaxonomyList } from '../../../../../../formsAndLists/taxonomy/List.tsx'

export const Route = createFileRoute(
  '/data/projects/$projectId_/taxonomies/$taxonomyId_/',
)({
  component: RouteComponent,
})

const RouteComponent = () => {
  return (
    <TaxonomyList
      from={'/data/projects/$projectId_/taxonomies/$taxonomyId_/'}
    />
  )
}
