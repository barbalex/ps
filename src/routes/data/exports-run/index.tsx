import { createFileRoute } from '@tanstack/react-router'

import { RootExportsRun } from '../../../formsAndLists/rootExportsRun.tsx'
import { NotFound } from '../../../components/NotFound.tsx'

export const Route = createFileRoute('/data/exports-run/')({
  component: RootExportsRun,
  notFoundComponent: NotFound,
})
