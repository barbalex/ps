import { createFileRoute } from '@tanstack/react-router'

import { ActionTaxonHistoryCompare } from '../../../../../../../../../../../../../formsAndLists/actionTaxon/HistoryCompare.tsx'

const from =
  '/data/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/actions/$actionId_/taxa/$actionTaxonId_/histories/$actionTaxonHistoryId'

export const Route = createFileRoute('/data/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/actions/$actionId_/taxa/$actionTaxonId_/histories/$actionTaxonHistoryId')({
  component: () => <ActionTaxonHistoryCompare from={from} />,
})
