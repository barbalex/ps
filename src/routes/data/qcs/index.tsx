import { createFileRoute } from '@tanstack/react-router'

import { Qcs } from '../../../formsAndLists/qcs.tsx'
import { NotFound } from '../../../components/NotFound.tsx'

export const Route = createFileRoute('/data/qcs/')({
  component: Qcs,
  notFoundComponent: NotFound,
})
