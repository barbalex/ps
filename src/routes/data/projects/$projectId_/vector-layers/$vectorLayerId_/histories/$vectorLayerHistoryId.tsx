import { createFileRoute } from '@tanstack/react-router'

import { VectorLayerHistoryCompare } from '../../../../../../../formsAndLists/vectorLayer/HistoryCompare.tsx'


export const Route = createFileRoute('/data/projects/$projectId_/vector-layers/$vectorLayerId_/histories/$vectorLayerHistoryId')({
  component: VectorLayerHistoryCompare,
})
