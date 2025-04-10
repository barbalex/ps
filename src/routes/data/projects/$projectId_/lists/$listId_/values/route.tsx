import { createFileRoute, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute(
  '/data/projects/$projectId_/lists/$listId_/values',
)({
  component: Outlet,
  beforeLoad: () => ({
    navDataFetcher: 'useListValuesNavData',
  }),
})
