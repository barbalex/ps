import { createFileRoute } from '@tanstack/react-router'

import { Index } from '../components/Index.tsx'

export const Route = createFileRoute('/_layout/')({
  component: Index,
})
