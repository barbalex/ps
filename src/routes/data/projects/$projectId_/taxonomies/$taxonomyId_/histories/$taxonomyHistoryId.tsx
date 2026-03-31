import { createFileRoute } from '@tanstack/react-router'

import { TaxonomyHistoryCompare } from '../../../../../../../formsAndLists/taxonomy/HistoryCompare.tsx'

const from =
  '/data/projects/$projectId_/taxonomies/$taxonomyId_/histories/$taxonomyHistoryId'

export const Route = createFileRoute(from)({
  component: TaxonomyHistoryCompare,
})
