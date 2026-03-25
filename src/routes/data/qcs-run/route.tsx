import { createFileRoute, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute('/data/qcs-run')({
  component: Outlet,
  beforeLoad: () => ({
    navDataFetcher: 'useRootQcsRunNavData',
  }),
})
