import { createFileRoute, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute('/data/qcs')({
  component: Outlet,
  beforeLoad: () => ({
    navDataFetcher: 'useQcsNavData',
  }),
})
