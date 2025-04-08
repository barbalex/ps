import { createFileRoute, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute('/data/_authLayout/files')({
  component: Outlet,
  beforeLoad: () => ({
    navDataFetcher: 'useFilesNavData',
  }),
})
