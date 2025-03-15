import * as React from 'react'
import { Outlet, createRootRoute } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'

import { NotFound } from '../components/NotFound.tsx'
import { ErrorPage } from '../formsAndLists/error.tsx'

export const Route = createRootRoute({
  component: RootComponent,
  defaultNotFoundComponent: NotFound,
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
