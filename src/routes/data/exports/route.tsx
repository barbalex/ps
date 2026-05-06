import { createFileRoute, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute('/data/exports')({
  component: Outlet,
  beforeLoad: () => ({
    navDataFetcher: 'useExportsNavData',
  }),
})
