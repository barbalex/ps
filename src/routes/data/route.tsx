import {
  createFileRoute,
  redirect,
  stripSearchParams,
} from '@tanstack/react-router'
import type { SearchMiddleware } from '@tanstack/react-router'

import { AuthAndDb } from '../../components/AuthAndDb.tsx'
import { Initiating } from '../../components/Initiating.tsx'
import { bootTrace } from '../../modules/bootTrace.ts'
import { NotFound } from '../../components/NotFound.tsx'
import { getSession } from '../../modules/authClient.ts'
import { isVerificationGraceExpired } from '../../modules/emailVerificationGrace.ts'
import { filterUrlKeyPrefix } from '../../modules/useUrlFilter.ts'
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

// plain validator instead of an arktype schema: this route's search segment
// is part of the eager entry chunk, and arktype + @ark/schema (~30 KB gz)
// came along with it. The param is only ever set programmatically (as a
// proper boolean), so permissive coercion is safe.
// `f-*` params carry list filters (see modules/useUrlFilter.ts); they are
// passed through unvalidated — values from hand-crafted links are coerced
// defensively by useUrlFilter.
type DataSearch = { onlyForm?: boolean } & Record<string, unknown>
const validateSearch = (search: Record<string, unknown>): DataSearch => {
  const result: DataSearch = { onlyForm: search.onlyForm === true }
  for (const [key, value] of Object.entries(search)) {
    if (key.startsWith(filterUrlKeyPrefix)) result[key] = value
  }
  return result
}

// Navigations build their search from the destination route's defaults, so
// without this middleware every link would drop the active filters. Retain
// the current location's `f-*` params unless the navigation itself set or
// cleared them (setting a param to undefined clears it and must win).
const retainFilterParams: SearchMiddleware<DataSearch> = ({ search, next }) => {
  const result = next(search)
  const copy: Record<string, unknown> = { ...result }
  for (const [key, value] of Object.entries(search)) {
    if (key.startsWith(filterUrlKeyPrefix) && !(key in copy)) {
      copy[key] = value
    }
  }
  return copy as DataSearch
}

export const Route = createFileRoute('/data')({
  component: AuthAndDb,
  validateSearch,
  search: {
    // stripSearchParams removes params equal to their defaults from the URL,
    // so `onlyForm` only appears when it is explicitly true
    middlewares: [stripSearchParams(defaultValues), retainFilterParams],
  },
  notFoundComponent: NotFound,
  // Without a pendingComponent the router suspends this route with a null
  // fallback while beforeLoad runs (auth check + PGlite creation), leaving a
  // blank screen after login. The pending UI is a plain spinner now, so a
  // short delay is enough to avoid flicker on quick redirects
  // (e.g. logged-out / → /data → /auth resolves fast) while covering the
  // boot gap.
  pendingMs: 300,
  pendingComponent: () => <Initiating />,
  beforeLoad: async ({ location }) => {
    bootTrace('beforeLoad start')
    // Start creating PGlite now, parallel with the auth check below; the
    // module and promise caches make repeats free. The detached catch keeps
    // an early redirect below from surfacing an unhandled rejection.
    const pgliteReady = import('../../modules/ensurePgliteDb.ts').then(
      ({ ensurePgliteDb }) => ensurePgliteDb(),
    )
    pgliteReady.catch(() => undefined)

    // 1. ensure user is authenticated
    const sessionVerified = store.get(sessionVerifiedAtom)

    if (sessionVerified || !navigator.onLine) {
      // Already verified this page-load (or offline): trust the persisted userId
      const userId = store.get(userIdAtom)
      if (!userId)
        throw redirect({ to: '/auth', search: { redirect: location.href } })
    } else {
      // First navigation this page-load: verify session with the auth server
      // once. Guard with a timeout: a hanging auth server would otherwise
      // leave the route (and its pending spinner) unresolved forever.
      let result: Awaited<ReturnType<typeof getSession>> | undefined
      try {
        result = await Promise.race([
          getSession({ query: { disableCookieCache: true } }),
          new Promise<undefined>((resolve) =>
            setTimeout(() => resolve(undefined), 10_000),
          ),
        ])
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
        await pgliteReady
        return { navDataFetcher: 'useDataBreadcrumbData' }
      }

      const session =
        result && typeof result === 'object' && 'data' in result ?
          (result as { data?: { user?: unknown } | null }).data
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
    await pgliteReady
    bootTrace('beforeLoad done')

    return { navDataFetcher: 'useDataBreadcrumbData' }
  },
})
