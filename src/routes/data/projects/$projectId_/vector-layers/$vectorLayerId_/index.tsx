import { createFileRoute } from '@tanstack/react-router'

import { VectorLayerList } from '../../../../../../formsAndLists/vectorLayer/List.tsx'
const from = '/data/projects/$projectId_/vector-layers/$vectorLayerId_/'

export const Route = createFileRoute(from)({
  component: () => (
    <VectorLayerList from="/data/projects/$projectId_/vector-layers/$vectorLayerId_/" />
  ),
})
