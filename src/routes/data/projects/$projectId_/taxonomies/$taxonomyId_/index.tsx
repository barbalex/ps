import { createFileRoute } from '@tanstack/react-router'

import { TaxonomyList } from '../../../../../../formsAndLists/taxonomy/List.tsx'
const from = '/data/projects/$projectId_/taxonomies/$taxonomyId_/'

export const Route = createFileRoute(from)({
  component: () => <TaxonomyList from={from} />,
})
