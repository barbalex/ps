import { createFileRoute } from '@tanstack/react-router'

import { Home } from '../components/index.tsx'

export const Route = createFileRoute('/_layout/')({
  component: Home,
})
