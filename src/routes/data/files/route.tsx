import { createFileRoute, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute('/data/files')({
  component: Outlet,
  beforeLoad: () => ({
    navDataFetcher: 'useFilesNavData',
  }),
})
