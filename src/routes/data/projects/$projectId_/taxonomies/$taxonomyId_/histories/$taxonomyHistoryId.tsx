import { createFileRoute } from '@tanstack/react-router'

import { TaxonomyHistoryCompare } from '../../../../../../../formsAndLists/taxonomy/HistoryCompare.tsx'


export const Route = createFileRoute('/data/projects/$projectId_/taxonomies/$taxonomyId_/histories/$taxonomyHistoryId')({
  component: TaxonomyHistoryCompare,
})
