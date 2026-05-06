import { createFileRoute } from '@tanstack/react-router'

import { Exports } from '../../../formsAndLists/exports.tsx'
import { NotFound } from '../../../components/NotFound.tsx'

export const Route = createFileRoute('/data/exports/')({
  component: Exports,
  notFoundComponent: NotFound,
})
