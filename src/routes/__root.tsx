import * as React from 'react'
import { Outlet, createRootRoute } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'

import { NotFound } from '../components/NotFound.tsx'

export const Route = createRootRoute({
  component: RootComponent,
  defaultNotFoundComponent: NotFound,
})

function RootComponent() {
  return (
    <>
      <Outlet />
      <TanStackRouterDevtools />
    </>
  )
}
