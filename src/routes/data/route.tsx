import {
  createFileRoute,
  redirect,
  stripSearchParams,
} from '@tanstack/react-router'
import { type } from 'arktype'

import { AuthAndDb } from '../../components/AuthAndDb.tsx'
import { NotFound } from '../../components/NotFound.tsx'
import { getSession } from '../../modules/authClient.ts'

// TODO:
// search params are only accessible on the route
const defaultValues = {
  onlyForm: false,
}

const schema = type({
  onlyForm: 'boolean = false',
})

export const Route = createFileRoute('/data')({
  component: AuthAndDb,
  validateSearch: schema,
  middlewares: [stripSearchParams(defaultValues)],
  notFoundComponent: NotFound,
  beforeLoad: async ({ location }) => {
    const result = await getSession({ query: { disableCookieCache: true } })
    const session =
      result && typeof result === 'object' && 'data' in result
        ? (result as { data?: { user?: unknown } | null }).data
        : (result as { user?: unknown } | null)
    if (!session?.user)
      throw redirect({
        to: '/auth',
        search: { redirect: location.href },
      })
    return { navDataFetcher: 'useDataBreadcrumbData' }
  },
})
