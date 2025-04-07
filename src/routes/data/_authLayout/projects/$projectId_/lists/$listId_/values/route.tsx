import { createFileRoute, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute(
  '/data/_authLayout/projects/$projectId_/lists/$listId_/values',
)({
  component: Outlet,
  beforeLoad: () => ({
    navDataFetcher: 'useListValuesNavData',
  }),
})
