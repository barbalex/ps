import { createFileRoute, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute('/data/qcs-assignment')({
  component: Outlet,
  beforeLoad: () => ({
    navDataFetcher: 'useRootQcsNavData',
  }),
})
