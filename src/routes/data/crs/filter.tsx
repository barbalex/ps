import { createFileRoute } from '@tanstack/react-router'

import { CrsFilter } from '../../../formsAndLists/crs/Filter.tsx'

const from = '/data/crs/filter'

export const Route = createFileRoute(from)({
  component: () => <CrsFilter from={from} />,
})
