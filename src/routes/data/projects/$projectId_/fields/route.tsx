import { createFileRoute, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute(
  '/data/projects/$projectId_/fields',
)({
  component: Outlet,
  beforeLoad: () => ({
    navDataFetcher: 'useFieldsNavData',
  }),
})
