import { createFileRoute } from '@tanstack/react-router'

import { RootQcs } from '../../../formsAndLists/rootQcs.tsx'
import { NotFound } from '../../../components/NotFound.tsx'

const from = '/data/qcs-assignment/'

export const Route = createFileRoute(from)({
  component: RootQcs,
  notFoundComponent: NotFound,
})
