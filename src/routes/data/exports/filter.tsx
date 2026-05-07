import { createFileRoute } from '@tanstack/react-router'

import { ExportFilter } from '../../../formsAndLists/export/Filter.tsx'

const from = '/data/exports/filter'

export const Route = createFileRoute('/data/exports/filter')({
  component: () => <ExportFilter from={from} />,
})
