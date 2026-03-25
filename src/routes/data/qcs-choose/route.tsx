import { createFileRoute, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute('/data/qcs-choose')({
  component: Outlet,
  beforeLoad: () => ({
    navDataFetcher: 'useRootQcsNavData',
  }),
})
