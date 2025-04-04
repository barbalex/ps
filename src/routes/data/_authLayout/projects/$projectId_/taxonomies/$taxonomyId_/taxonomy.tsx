import { createFileRoute } from '@tanstack/react-router'

import { Taxonomy } from '../../../../../../../formsAndLists/taxonomy/index.tsx'

export const Route = createFileRoute(
  '/data/_authLayout/projects/$projectId_/taxonomies/$taxonomyId_/taxonomy',
)({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <Taxonomy
      from={
        '/data/_authLayout/projects/$projectId_/taxonomies/$taxonomyId_/taxonomy'
      }
    />
  )
}
