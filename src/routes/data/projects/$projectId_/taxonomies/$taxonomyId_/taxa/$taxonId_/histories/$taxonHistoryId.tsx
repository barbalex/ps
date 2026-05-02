import { createFileRoute } from '@tanstack/react-router'

import { TaxonHistoryCompare } from '../../../../../../../../../formsAndLists/taxon/HistoryCompare.tsx'


export const Route = createFileRoute('/data/projects/$projectId_/taxonomies/$taxonomyId_/taxa/$taxonId_/histories/$taxonHistoryId')({
  component: TaxonHistoryCompare,
})
