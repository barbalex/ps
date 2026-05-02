import { createFileRoute } from '@tanstack/react-router'

import { WfsServiceList } from '../../../../../../formsAndLists/wfsService/List.tsx'
const from = '/data/projects/$projectId_/wfs-services/$wfsServiceId_/'

export const Route = createFileRoute('/data/projects/$projectId_/wfs-services/$wfsServiceId_/')({
  component: () => <WfsServiceList from={from} />,
})
