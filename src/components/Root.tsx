import { Outlet, Scripts } from '@tanstack/react-router'

export const Root = () => (
  <>
    <Outlet />
    <Scripts />
  </>
)
