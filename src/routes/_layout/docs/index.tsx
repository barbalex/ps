import { createFileRoute } from '@tanstack/react-router'

import { NotFound } from '../../../components/NotFound.tsx'

export const Route = createFileRoute('/_layout/docs/')({
  component: () => null,
  notFoundComponent: NotFound,
})
