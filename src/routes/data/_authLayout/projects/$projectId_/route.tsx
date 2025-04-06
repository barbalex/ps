import { createFileRoute, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute('/data/_authLayout/projects/$projectId_')({
  component: Outlet,
  beforeLoad: () => ({
    navDataFetcher: 'useProjectNavData',
  }),
})
