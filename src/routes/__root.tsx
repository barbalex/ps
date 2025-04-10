import * as React from 'react'
import { Outlet, createRootRoute } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'

import { NotFoundRoot } from '../components/NotFoundRoot.tsx'
import { ErrorPage } from '../formsAndLists/error.tsx'

export const Route = createRootRoute({
  component: RootComponent,
  defaultNotFoundComponent: NotFoundRoot,
  notFoundComponent: NotFoundRoot,
  // notFoundComponent: () => <Outlet />,
  notFoundMode: 'root',
  errorComponent: ErrorPage,
  defaultErrorComponent: ErrorPage,
})

function RootComponent() {
  return (
    <>
      <Outlet />
      <TanStackRouterDevtools />
    </>
  )
}
