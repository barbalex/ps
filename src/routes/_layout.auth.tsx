import { createFileRoute } from '@tanstack/react-router'
import { type } from 'arktype'

import { Auth } from '../components/Auth.tsx'
import { ensurePgliteDb } from '../modules/ensurePgliteDb.ts'

const schema = type({ redirect: 'string = "/data/projects"' })

export const Route = createFileRoute('/_layout/auth')({
  component: Auth,
  validateSearch: schema,
  beforeLoad: async () => {
    await ensurePgliteDb()
  },
})
