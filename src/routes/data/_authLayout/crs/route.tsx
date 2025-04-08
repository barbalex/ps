import { createFileRoute, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute('/data/_authLayout/crs')({
  component: Outlet,
  beforeLoad: () => ({
    navDataFetcher: 'useCrssNavData',
  }),
})
