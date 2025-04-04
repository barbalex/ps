import { createFileRoute } from '@tanstack/react-router'

import { TaxonomyList } from '../../../../../../formsAndLists/taxonomy/List.tsx'

export const Route = createFileRoute(
  '/data/_authLayout/projects/$projectId_/taxonomies/$taxonomyId/',
)({
  component: RouteComponent,
})

const RouteComponent = () => {
  return (
    <TaxonomyList
      from={'/data/_authLayout/projects/$projectId_/taxonomies/$taxonomyId/'}
    />
  )
}
