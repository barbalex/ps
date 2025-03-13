import { createFileRoute } from '@tanstack/react-router'

import { AuthAndDb } from '../../components/AuthAndDb.tsx'

export const Route = createFileRoute('/data/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <AuthAndDb />
}
