import { createFileRoute, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute(
  '/data/projects/$projectId_/configuration',
)({
  component: Outlet,
  beforeLoad: () => ({
    navDataFetcher: 'useProjectDesignNavData',
  }),
})
