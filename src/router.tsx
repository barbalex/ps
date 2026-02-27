import { createRouter } from '@tanstack/react-router'

import { routeTree } from './routeTree.gen'
import { RouterErrorBoundary } from './components/shared/RouterErrorBoundary.tsx'

// TODO: add defaultErrorComponent
// https://tanstack.com/start/latest/docs/framework/react/guide/error-boundaries
export const router = createRouter({
  routeTree,
  scrollRestoration: true,
  defaultErrorComponent: ({ error }) => <RouterErrorBoundary error={error} />,
})

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}
