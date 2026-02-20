import { createFileRoute } from '@tanstack/react-router'

import { TaxonomyFilter } from '../../../../../formsAndLists/taxonomy/Filter.tsx'

const from = '/data/projects/$projectId_/taxonomies/filter'

export const Route = createFileRoute(from)({
  component: () => <TaxonomyFilter from={from} />,
})
