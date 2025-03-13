import * as React from 'react'
import { Outlet, createRootRoute } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/router-devtools'

import { Header } from '../components/Layout/Header/index.tsx'

export const Route = createRootRoute({
  component: RootComponent,
})

const homeOutletStyle = {
  display: 'flex',
  flexDirection: 'column',
  flexGrow: 1,
  overflow: 'hidden',
  position: 'relative',
}

function RootComponent() {
  return (
    <>
      <Header />
      <div style={homeOutletStyle}>
        <Outlet />
      </div>
      <TanStackRouterDevtools />
    </>
  )
}
