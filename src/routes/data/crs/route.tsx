import { createFileRoute, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute('/data/crs')({
  component: Outlet,
  beforeLoad: () => ({
    navDataFetcher: 'useCrssNavData',
  }),
})
