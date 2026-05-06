import { createFileRoute, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute('/data/qc-assignments')({
  component: Outlet,
  beforeLoad: () => ({
    navDataFetcher: 'useRootQcsNavData',
  }),
})
