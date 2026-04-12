import { createFileRoute } from '@tanstack/react-router'
import { type } from 'arktype'

import { Auth } from '../components/Auth.tsx'

const schema = type({ redirect: 'string = "/data/projects"' })

export const Route = createFileRoute('/_layout/auth')({
  component: Auth,
  validateSearch: schema,
})
