import { createFileRoute, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute('/data/projects/$projectId_/design')({
  component: Outlet,
  beforeLoad: () => ({
    navDataFetcher: 'useProjectDesignNavData',
  }),
})
