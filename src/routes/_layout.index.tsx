import { createFileRoute } from '@tanstack/react-router'

import { Index } from '../components/index.tsx'

export const Route = createFileRoute('/_layout/')({
  component: Index,
})
