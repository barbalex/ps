import { createFileRoute } from '@tanstack/react-router'

import { SubprojectTaxonHistoryCompare } from '../../../../../../../../../formsAndLists/subprojectTaxon/HistoryCompare.tsx'


export const Route = createFileRoute('/data/projects/$projectId_/subprojects/$subprojectId_/taxa/$subprojectTaxonId_/histories/$subprojectTaxonHistoryId')({
  component: SubprojectTaxonHistoryCompare,
})
