import { createFileRoute } from '@tanstack/react-router'

import { PlaceLevelHistoryCompare } from '../../../../../../../formsAndLists/placeLevel/HistoryCompare.tsx'


export const Route = createFileRoute('/data/projects/$projectId_/place-levels/$placeLevelId_/histories/$placeLevelHistoryId')({
  component: PlaceLevelHistoryCompare,
})
