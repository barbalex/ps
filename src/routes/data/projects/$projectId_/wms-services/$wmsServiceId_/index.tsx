import { createFileRoute } from '@tanstack/react-router'

import { WmsServiceList } from '../../../../../../formsAndLists/wmsService/List.tsx'
const from = '/data/projects/$projectId_/wms-services/$wmsServiceId_/'

export const Route = createFileRoute(from)({
  component: () => <WmsServiceList from={from} />,
})
