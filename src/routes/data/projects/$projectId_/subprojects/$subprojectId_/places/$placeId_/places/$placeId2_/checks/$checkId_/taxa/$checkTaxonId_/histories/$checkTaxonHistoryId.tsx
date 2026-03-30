import { createFileRoute } from '@tanstack/react-router'

import { CheckTaxonHistoryCompare } from '../../../../../../../../../../../../../../../formsAndLists/checkTaxon/HistoryCompare.tsx'

const from =
  '/data/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/places/$placeId2_/checks/$checkId_/taxa/$checkTaxonId_/histories/$checkTaxonHistoryId'

export const Route = createFileRoute(from)({
  component: () => <CheckTaxonHistoryCompare from={from} />,
})
