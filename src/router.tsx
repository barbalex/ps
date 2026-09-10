import { createRouter } from '@tanstack/react-router'

import { routeTree } from './routeTree.gen'
import { RouterErrorBoundary } from './components/shared/RouterErrorBoundary.tsx'
import { DefaultPending } from './components/shared/DefaultPending.tsx'

// TODO: add defaultErrorComponent
// https://tanstack.com/start/latest/docs/framework/react/guide/error-boundaries
export const router = createRouter({
  routeTree,
  scrollRestoration: true,
  defaultPendingComponent: DefaultPending,
  defaultErrorComponent: ({ error }) => <RouterErrorBoundary error={error} />,
})

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}
