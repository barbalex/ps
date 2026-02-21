import { createFileRoute } from '@tanstack/react-router'

import { VectorLayerDisplays } from '../../../../../../../formsAndLists/vectorLayerDisplays.tsx'
import { NotFound } from '../../../../../../../components/NotFound.tsx'
const from =
  '/data/projects/$projectId_/vector-layers/$vectorLayerId_/displays/'

export const Route = createFileRoute(from)({
  component: () => (
    <VectorLayerDisplays from="/data/projects/$projectId_/vector-layers/$vectorLayerId_/displays/" />
  ),
  notFoundComponent: NotFound,
})
