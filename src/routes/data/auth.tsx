import { createFileRoute } from '@tanstack/react-router'

import { Auth } from '../../components/Auth.tsx'

export const Route = createFileRoute('/data/auth')({
  component: Auth,
})
