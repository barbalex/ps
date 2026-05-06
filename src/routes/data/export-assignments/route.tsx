import { createFileRoute, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute('/data/export-assignments')({
  component: Outlet,
  beforeLoad: () => ({
    navDataFetcher: 'useRootExportsNavData',
  }),
})
