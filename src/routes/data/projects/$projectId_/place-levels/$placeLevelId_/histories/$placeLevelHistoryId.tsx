import { createFileRoute } from '@tanstack/react-router'

import { PlaceLevelHistoryCompare } from '../../../../../../../formsAndLists/placeLevel/HistoryCompare.tsx'

const from =
  '/data/projects/$projectId_/place-levels/$placeLevelId_/histories/$placeLevelHistoryId'

export const Route = createFileRoute(from)({
  component: PlaceLevelHistoryCompare,
})
