import { createFileRoute, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute('/data/exports-run')({
  component: Outlet,
  beforeLoad: () => ({
    navDataFetcher: 'useRootExportsRunNavData',
  }),
})
