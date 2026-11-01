import { createRouter } from '@tanstack/react-router'

import { routeTree } from './routeTree.gen'
import { RouterErrorBoundary } from './components/shared/RouterErrorBoundary.tsx'
import { DefaultPending } from './components/shared/DefaultPending.tsx'
import { flushAggregatedUpdates } from './modules/operationAggregation.ts'

export const router = createRouter({
  routeTree,
  scrollRestoration: true,
  defaultPendingComponent: DefaultPending,
  defaultErrorComponent: ({ error }) => (
    <RouterErrorBoundary error={error as Error} />
  ),
})

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

// navigating away from a form ends its editing session: flush field edits
// buffered by the update aggregation before the form unmounts
router.history.subscribe(() => {
  flushAggregatedUpdates()
})

if (import.meta.env.DEV) {
  ;(window as unknown as { __router__?: unknown }).__router__ = router
}
