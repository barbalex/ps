import {
  createFileRoute,
  redirect,
  stripSearchParams,
} from '@tanstack/react-router'
import { type } from 'arktype'

import { AuthAndDb } from '../../components/AuthAndDb.tsx'
import { Initiating } from '../../components/Initiating.tsx'
import { NotFound } from '../../components/NotFound.tsx'
import { getSession } from '../../modules/authClient.ts'
import { isVerificationGraceExpired } from '../../modules/emailVerificationGrace.ts'
import { ensurePgliteDb } from '../../modules/ensurePgliteDb.ts'

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
  pendingComponent: () => <Initiating forceSqlInitializing />,
  // needed so Initiating does not flash on every route under /data when the auth/db state is being revalidated
  pendingMs: 250,
  validateSearch: schema,
  middlewares: [stripSearchParams(defaultValues)],
  notFoundComponent: NotFound,
  beforeLoad: async ({ location }) => {
    // 1. ensure user is authenticated
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

    // 1b. allow unverified users only during grace window
    const sessionUser = session.user as {
      emailVerified?: boolean | null
      createdAt?: string | null
    }
    if (isVerificationGraceExpired(sessionUser)) {
      throw redirect({
        to: '/auth',
        search: {
          redirect: location.href,
          verificationExpired: true,
        },
      })
    }

    // 2. Ensure a DB instance exists before protected route components mount
    await ensurePgliteDb()

    return { navDataFetcher: 'useDataBreadcrumbData' }
  },
})
