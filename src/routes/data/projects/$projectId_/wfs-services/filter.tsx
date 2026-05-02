import { createFileRoute } from '@tanstack/react-router'

import { WfsServiceFilter } from '../../../../../formsAndLists/wfsService/Filter.tsx'

const from = '/data/projects/$projectId_/wfs-services/filter'

export const Route = createFileRoute('/data/projects/$projectId_/wfs-services/filter')({
  component: () => <WfsServiceFilter from={from} />,
})
