import { createFileRoute } from '@tanstack/react-router'

import { RootExports } from '../../../formsAndLists/rootExports.tsx'
import { NotFound } from '../../../components/NotFound.tsx'

export const Route = createFileRoute('/data/export-assignments/')({
  component: RootExports,
  notFoundComponent: NotFound,
})
