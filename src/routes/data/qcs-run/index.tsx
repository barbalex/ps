import { createFileRoute } from '@tanstack/react-router'

import { RootQcsRun } from '../../../formsAndLists/rootQcsRun.tsx'
import { NotFound } from '../../../components/NotFound.tsx'


export const Route = createFileRoute('/data/qcs-run/')({
  component: RootQcsRun,
  notFoundComponent: NotFound,
})
