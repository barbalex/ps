import { createFileRoute } from '@tanstack/react-router'

import { Auth } from '../components/Auth.tsx'

export const Route = createFileRoute('/_layout/auth')({
  component: Auth,
})
