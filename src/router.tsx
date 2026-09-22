import { createRouter } from '@tanstack/react-router'

import { routeTree } from './routeTree.gen'
import { RouterErrorBoundary } from './components/shared/RouterErrorBoundary.tsx'
import { DefaultPending } from './components/shared/DefaultPending.tsx'

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

if (import.meta.env.DEV) {
  ;(window as unknown as { __router__?: unknown }).__router__ = router
}
