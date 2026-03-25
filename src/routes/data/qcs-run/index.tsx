import { createFileRoute } from '@tanstack/react-router'

import { RootQcsRun } from '../../../formsAndLists/rootQcsRun.tsx'
import { NotFound } from '../../../components/NotFound.tsx'

const from = '/data/qcs-run/'

export const Route = createFileRoute(from)({
  component: RootQcsRun,
  notFoundComponent: NotFound,
})
