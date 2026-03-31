import { createFileRoute } from '@tanstack/react-router'

import { SubprojectTaxonHistoryCompare } from '../../../../../../../../../formsAndLists/subprojectTaxon/HistoryCompare.tsx'

const from =
  '/data/projects/$projectId_/subprojects/$subprojectId_/taxa/$subprojectTaxonId_/histories/$subprojectTaxonHistoryId'

export const Route = createFileRoute(from)({
  component: SubprojectTaxonHistoryCompare,
})
