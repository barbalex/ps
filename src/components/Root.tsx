import { Outlet, Scripts } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'

export const Root = () => (
  <>
    <Outlet />
    <Scripts />
    <TanStackRouterDevtools />
  </>
)
