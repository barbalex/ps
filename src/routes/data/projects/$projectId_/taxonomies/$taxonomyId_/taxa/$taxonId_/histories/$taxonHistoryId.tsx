import { createFileRoute } from '@tanstack/react-router'

import { TaxonHistoryCompare } from '../../../../../../../../../formsAndLists/taxon/HistoryCompare.tsx'

const from =
  '/data/projects/$projectId_/taxonomies/$taxonomyId_/taxa/$taxonId_/histories/$taxonHistoryId'

export const Route = createFileRoute(from)({
  component: TaxonHistoryCompare,
})
