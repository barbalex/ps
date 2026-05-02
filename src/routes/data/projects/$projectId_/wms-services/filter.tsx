import { createFileRoute } from '@tanstack/react-router'

import { WmsServiceFilter } from '../../../../../formsAndLists/wmsService/Filter.tsx'

const from = '/data/projects/$projectId_/wms-services/filter'

export const Route = createFileRoute('/data/projects/$projectId_/wms-services/filter')({
  component: () => <WmsServiceFilter from={from} />,
})
