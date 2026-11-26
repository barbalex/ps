import { Outlet, Scripts } from '@tanstack/react-router'
import { ThemeBackgroundSync } from './ThemeBackgroundSync.tsx'

export const Root = () => (
  <>
    <ThemeBackgroundSync />
    <Outlet />
    <Scripts />
  </>
)
