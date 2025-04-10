import { createFileRoute, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute(
  '/data/projects/$projectId_/lists/$listId_',
)({
  component: Outlet,
  beforeLoad: () => ({
    navDataFetcher: 'useListNavData',
  }),
})
