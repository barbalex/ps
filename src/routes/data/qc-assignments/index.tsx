import { createFileRoute } from '@tanstack/react-router'

import { RootQcs } from '../../../formsAndLists/rootQcs.tsx'
import { NotFound } from '../../../components/NotFound.tsx'


export const Route = createFileRoute('/data/qc-assignments/')({
  component: RootQcs,
  notFoundComponent: NotFound,
})
