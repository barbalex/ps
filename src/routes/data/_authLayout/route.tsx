import { createFileRoute } from '@tanstack/react-router'

import { AuthAndDb } from '../../../components/AuthAndDb.tsx'
import { NotFound } from '../../../components/NotFound.tsx'

export const Route = createFileRoute('/data/_authLayout')({
  component: AuthAndDb,
  defaultNotFoundComponent: NotFound,
})
