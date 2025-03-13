import { createFileRoute } from '@tanstack/react-router'

import { AuthAndDb } from '../../../components/AuthAndDb.tsx'

export const Route = createFileRoute('/data/_authLayout')({
  component: Component,
})

function Component() {
  return <AuthAndDb />
}
