import { createFileRoute } from '@tanstack/react-router'

import { WfsServiceList } from '../../../../../../formsAndLists/wfsService/List.tsx'
const from = '/data/projects/$projectId_/wfs-services/$wfsServiceId_/'

export const Route = createFileRoute(from)({
  component: () => <WfsServiceList from={from} />,
})
