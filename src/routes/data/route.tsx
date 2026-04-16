import {
  createFileRoute,
  redirect,
  stripSearchParams,
} from '@tanstack/react-router'
import { type } from 'arktype'

import { AuthAndDb } from '../../components/AuthAndDb.tsx'
import { NotFound } from '../../components/NotFound.tsx'
import { getSession } from '../../modules/authClient.ts'
import { isVerificationGraceExpired } from '../../modules/emailVerificationGrace.ts'
import { ensurePgliteDb } from '../../modules/ensurePgliteDb.ts'
import {
  sessionVerifiedAtom,
  store,
  userEmailAtom,
  userIdAtom,
} from '../../store.ts'

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
    // 1. ensure user is authenticated
    const sessionVerified = store.get(sessionVerifiedAtom)

    if (sessionVerified || !navigator.onLine) {
      // Already verified this page-load (or offline): trust the persisted userId
      const userId = store.get(userIdAtom)
      if (!userId)
        throw redirect({ to: '/auth', search: { redirect: location.href } })
    } else {
      // First navigation this page-load: verify session with the auth server once
      let result: Awaited<ReturnType<typeof getSession>> | undefined
      try {
        result = await getSession({ query: { disableCookieCache: true } })
      } catch {
        // betterFetch threw (e.g. CORS / connection refused)
      }

      // betterFetch may also return { data: null, error: ... } instead of throwing
      const hasNetworkError =
        !result ||
        (typeof result === 'object' &&
          'error' in result &&
          (result as { error?: unknown }).error != null &&
          !(
            typeof result === 'object' &&
            'data' in result &&
            (result as { data?: unknown }).data != null
          ))

      if (hasNetworkError) {
        // Server unreachable: fall back to the persisted userId from a previous session
        const userId = store.get(userIdAtom)
        if (!userId)
          throw redirect({ to: '/auth', search: { redirect: location.href } })
        await ensurePgliteDb()
        return { navDataFetcher: 'useDataBreadcrumbData' }
      }

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
        id?: string
        email?: string
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

      store.set(userIdAtom, sessionUser.id ?? null)
      store.set(userEmailAtom, sessionUser.email ?? null)
      store.set(sessionVerifiedAtom, true)
    }

    // 2. Ensure a DB instance exists before protected route components mount
    await ensurePgliteDb()

    return { navDataFetcher: 'useDataBreadcrumbData' }
  },
})
